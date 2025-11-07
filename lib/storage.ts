// Simple in-memory storage for demo mode
// In production, this would use Supabase
// Note: This storage persists only during server runtime
// For permanent storage, configure Supabase

// Use globalThis to persist across serverless function invocations
declare global {
  var __bizzaiStorage: {
    storage: Record<string, Record<string, string>>
    agentsStorage: Record<string, any[]>
    globalAgentsStorage: any[]
  } | undefined
}

const getStorage = () => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.__bizzaiStorage) {
      globalThis.__bizzaiStorage = {
        storage: {},
        agentsStorage: {},
        globalAgentsStorage: [],
      }
    }
    return globalThis.__bizzaiStorage
  }
  // Fallback for environments without globalThis
  return {
    storage: {},
    agentsStorage: {},
    globalAgentsStorage: [],
  }
}

const storageObj = getStorage()
const storage: Record<string, Record<string, string>> = storageObj.storage
const agentsStorage: Record<string, any[]> = storageObj.agentsStorage
const globalAgentsStorage: any[] = storageObj.globalAgentsStorage

export function getSetting(userId: string, key: string): string | null {
  return storage[userId]?.[key] || null
}

export function setSetting(userId: string, key: string, value: string): void {
  if (!storage[userId]) {
    storage[userId] = {}
  }
  storage[userId][key] = value
  console.log(`[Storage] Saved ${key} for user ${userId}:`, value.substring(0, 10) + '...')
}

export function getAllSettings(userId: string): Record<string, string> {
  const settings = storage[userId] || {}
  console.log(`[Storage] Retrieved ${Object.keys(settings).length} settings for user ${userId}`)
  return settings
}

export function clearSettings(userId: string): void {
  delete storage[userId]
}

// Agents storage - improved to persist across requests
export function saveAgent(userId: string, agent: any): void {
  if (!agentsStorage[userId]) {
    agentsStorage[userId] = []
  }
  
  // Check if agent already exists (by ID)
  const existingIndex = agentsStorage[userId].findIndex(a => a.id === agent.id)
  if (existingIndex >= 0) {
    // Update existing agent
    agentsStorage[userId][existingIndex] = { ...agentsStorage[userId][existingIndex], ...agent }
    console.log(`[Storage] Updated agent ${agent.id} for user ${userId}`)
  } else {
    // Add new agent
    agentsStorage[userId].push(agent)
    console.log(`[Storage] Saved agent ${agent.id} for user ${userId}`)
  }
  
  // Also save to global storage for cross-user access
  const globalIndex = globalAgentsStorage.findIndex(a => a.id === agent.id)
  if (globalIndex >= 0) {
    globalAgentsStorage[globalIndex] = { ...globalAgentsStorage[globalIndex], ...agent }
  } else {
    globalAgentsStorage.push(agent)
  }
  
  console.log(`[Storage] Total agents in global storage: ${globalAgentsStorage.length}`)
}

export function getAgents(userId: string): any[] {
  const userAgents = agentsStorage[userId] || []
  // Merge with global storage for demo mode
  const allAgents = [...userAgents]
  
  // Add agents from global storage that aren't already in user's list
  globalAgentsStorage.forEach(agent => {
    if (!allAgents.find(a => a.id === agent.id)) {
      allAgents.push(agent)
    }
  })
  
  console.log(`[Storage] Retrieved ${allAgents.length} agents for user ${userId} (${userAgents.length} user-specific, ${globalAgentsStorage.length} global)`)
  return allAgents
}

export function deleteAgent(userId: string, agentId: string): void {
  if (agentsStorage[userId]) {
    agentsStorage[userId] = agentsStorage[userId].filter(a => a.id !== agentId)
    console.log(`[Storage] Deleted agent ${agentId} for user ${userId}`)
  }
  
  // Also remove from global storage
  const globalIndex = globalAgentsStorage.findIndex(a => a.id === agentId)
  if (globalIndex >= 0) {
    globalAgentsStorage.splice(globalIndex, 1)
    console.log(`[Storage] Deleted agent ${agentId} from global storage`)
  }
}

// Debug function
export function debugStorage(): Record<string, Record<string, string>> {
  return storage
}

export function debugAgents(): Record<string, any[]> {
  return agentsStorage
}

export function getAllAgents(): any[] {
  return [...globalAgentsStorage]
}

// Clear all storage (for testing/reset)
export function clearAllStorage(): void {
  // Clear user-specific storage
  Object.keys(agentsStorage).forEach(userId => {
    delete agentsStorage[userId]
  })
  
  // Clear global storage
  globalAgentsStorage.length = 0
  
  // Clear settings storage
  Object.keys(storage).forEach(userId => {
    delete storage[userId]
  })
  
  console.log('[Storage] All storage cleared')
}
