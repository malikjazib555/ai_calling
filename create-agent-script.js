// Quick script to create agent with phone number +12175798709
// Run this in browser console or create via API

const createAgent = async () => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'My Agent',
      description: 'AI Phone Agent',
      phone_number: '+12175798709',
      is_active: true,
    }),
  })
  
  const data = await response.json()
  console.log('Agent created:', data)
  return data
}

// Run: createAgent()

