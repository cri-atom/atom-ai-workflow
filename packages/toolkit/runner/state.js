import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const STATE_FILE = 'state.json'

export function initState(project) {
  const date = new Date().toISOString().split('T')[0]
  return {
    run_id: `${date}-${project.toLowerCase().replace(/\s+/g, '-')}`,
    project,
    phase: 'discovery',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: {},
    context_stack: [],
    async_pending: [],
  }
}

export function loadState(stateDir) {
  const path = join(stateDir, STATE_FILE)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

export function saveState(state, stateDir) {
  state.updated_at = new Date().toISOString()
  writeFileSync(join(stateDir, STATE_FILE), JSON.stringify(state, null, 2), 'utf8')
}
