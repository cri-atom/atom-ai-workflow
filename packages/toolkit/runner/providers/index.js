import { callClaude } from './claude.js'
import { callGemini } from './gemini.js'
import { callKimi }   from './kimi.js'

export async function callProvider({ provider, model, system, message, max_tokens }) {
  switch (provider) {
    case 'claude': return callClaude({ model, system, message, max_tokens })
    case 'gemini': return callGemini({ model, system, message, max_tokens })
    case 'kimi':   return callKimi({ model, system, message, max_tokens })
    default:
      throw new Error(`Unknown provider: ${provider}. Available: claude, gemini, kimi`)
  }
}
