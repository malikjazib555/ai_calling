import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  confidence: number
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text. Respond with JSON: {"sentiment": "positive|neutral|negative", "score": -1 to 1, "confidence": 0 to 1}',
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      sentiment: result.sentiment || 'neutral',
      score: result.score || 0,
      confidence: result.confidence || 0.5,
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0,
    }
  }
}

export async function detectIntent(text: string): Promise<{
  intent: string
  confidence: number
  entities: Record<string, any>
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Detect the intent from the following text. Respond with JSON: {"intent": "order|inquiry|complaint|support", "confidence": 0 to 1, "entities": {}}',
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      intent: result.intent || 'inquiry',
      confidence: result.confidence || 0.5,
      entities: result.entities || {},
    }
  } catch (error) {
    console.error('Intent detection error:', error)
    return {
      intent: 'inquiry',
      confidence: 0,
      entities: {},
    }
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Detect the language of the following text. Respond with only the ISO 639-1 language code (e.g., "en", "ur", "hi", "es").',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
    })

    return completion.choices[0].message.content?.trim().toLowerCase() || 'en'
  } catch (error) {
    console.error('Language detection error:', error)
    return 'en'
  }
}

