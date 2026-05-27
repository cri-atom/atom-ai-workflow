#!/usr/bin/env node

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { parseArgs } from 'util'
import { loadConfig } from './config.js'
import { loadRegistry } from './registry.js'
import { runSkill } from './pipeline.js'
import { loadState, saveState, initState } from './state.js'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    pipeline: { type: 'string', short: 'p' },
    project:  { type: 'string' },
    resume:   { type: 'boolean', default: false },
    dry:      { type: 'boolean', default: false },
    help:     { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
})

const [command, ...args] = positionals

if (values.help || !command) {
  console.log(`
atom-ai — AI Workflow CLI

USAGE
  npx atom-ai run <skill-id>           Run a single skill
  npx atom-ai run --pipeline <name>    Run a named pipeline
  npx atom-ai pipe <skill> <skill>     Chain skills manually
  npx atom-ai status                   Show current run state
  npx atom-ai resume                   Resume a paused run
  npx atom-ai init                     Initialize state in current directory

OPTIONS
  --project <name>    Project name (used in state file)
  --pipeline <name>   Named pipeline from _registry.yml
  --resume            Resume from last checkpoint
  --dry               Print what would run, without calling the API
  -h, --help          Show this help

SKILLS
  ux-analysis-redesign        Diagnose existing UI and propose redesign
  user-flows-breadboarding    Generate UX flows from any input
  frd-hdu                     Generate FRD with user stories and criteria
  figma-handoff-structure     Generate Figma canvas assembly guide
  ds-component-docs           Generate DS component documentation

PIPELINES
  full        ux-analysis-redesign → flows → frd → handoff
  redesign    ux-analysis-redesign → flows → frd → handoff
  flows-only  user-flows-breadboarding
  frd-only    frd-hdu
  handoff-only figma-handoff-structure
  ds          ds-component-docs

EXAMPLES
  npx atom-ai run user-flows-breadboarding
  npx atom-ai run --pipeline full --project "genesys-oauth"
  npx atom-ai pipe user-flows-breadboarding frd-hdu
  npx atom-ai status
  npx atom-ai resume
`)
  process.exit(0)
}

const config   = loadConfig()
const registry = loadRegistry()

async function main() {
  if (command === 'init') {
    const stateDir = join(process.cwd(), config.pipeline.state_dir)
    if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true })
    const state = initState(values.project || 'unnamed')
    saveState(state, stateDir)
    console.log(`✓ Initialized .atom-ai/state.json for project "${state.project}"`)
    return
  }

  if (command === 'status') {
    const stateDir = join(process.cwd(), config.pipeline.state_dir)
    const state = loadState(stateDir)
    if (!state) { console.log('No active run. Use: npx atom-ai init'); return }
    console.log(`\nProject: ${state.project}`)
    console.log(`Phase:   ${state.phase}`)
    console.log(`Updated: ${state.updated_at}\n`)
    for (const [id, rec] of Object.entries(state.skills)) {
      const icon = { done: '✓', running: '▶', pending: '○', skipped: '–', failed: '✗' }[rec.status] || '?'
      console.log(`  ${icon}  ${id.padEnd(32)} ${rec.status}`)
    }
    console.log()
    return
  }

  if (command === 'resume') {
    const stateDir = join(process.cwd(), config.pipeline.state_dir)
    const state = loadState(stateDir)
    if (!state) { console.log('No active run to resume.'); return }
    const pending = Object.entries(state.skills)
      .filter(([, r]) => r.status === 'pending' || r.status === 'running')
      .map(([id]) => id)
    if (!pending.length) { console.log('All skills complete.'); return }
    console.log(`Resuming from: ${pending[0]}`)
    for (const skillId of pending) {
      await runSkill(skillId, config, registry, state, values.dry)
    }
    return
  }

  if (command === 'run') {
    const stateDir = join(process.cwd(), config.pipeline.state_dir)
    let state = loadState(stateDir) || initState(values.project || 'unnamed')

    if (values.pipeline) {
      const pipeline = registry.pipelines?.[values.pipeline]
      if (!pipeline) {
        console.error(`Unknown pipeline: ${values.pipeline}`)
        console.error(`Available: ${Object.keys(registry.pipelines || {}).join(', ')}`)
        process.exit(1)
      }
      console.log(`\nRunning pipeline: ${values.pipeline}`)
      console.log(`Steps: ${pipeline.steps.join(' → ')}\n`)
      for (const skillId of pipeline.steps) {
        await runSkill(skillId, config, registry, state, values.dry)
      }
    } else {
      const skillId = args[0]
      if (!skillId) { console.error('Specify a skill-id or use --pipeline'); process.exit(1) }
      await runSkill(skillId, config, registry, state, values.dry)
    }
    return
  }

  if (command === 'pipe') {
    const stateDir = join(process.cwd(), config.pipeline.state_dir)
    let state = loadState(stateDir) || initState(values.project || 'unnamed')
    const chain = args
    if (!chain.length) { console.error('Provide skill ids to chain'); process.exit(1) }
    console.log(`\nChaining: ${chain.join(' | ')}\n`)
    for (const skillId of chain) {
      await runSkill(skillId, config, registry, state, values.dry)
    }
    return
  }

  console.error(`Unknown command: ${command}`)
  process.exit(1)
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
