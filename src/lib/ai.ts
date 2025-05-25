import { mistral } from './mistral'

export async function generateTechNews(technologies: string[] = []) {
  const prompt = technologies.length > 0
    ? `Generate a brief, informative news update about the following technologies: ${technologies.join(', ')}. Focus on recent developments, trends, or important updates.`
    : 'Generate a brief, informative news update about recent developments in AI, web development, and software engineering. Focus on significant trends or important updates.'

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Unexpected response format from AI')
    }

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating news:', error)
    throw new Error('Failed to generate news update')
  }
} 