import { supabase } from '@/lib/supabase'
import { mistral } from '@/lib/mistral'

// Helper function to clean and parse JSON response
function parseAIResponse(content: string) {
  try {
    // Remove markdown code block formatting if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')  // Remove opening ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove any extra whitespace
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.debug('Raw content:', content);
    throw error;
  }
}

export async function enrichUnanalyzedArticles() {
  // Get all articles that haven't been analyzed yet
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, url')
    .is('ai_analyzed_at', null)
    .order('published_at', { ascending: false })

  if (fetchError) throw fetchError

  console.group('🤖 AI Enrichment Started')
  console.info(`Found ${articles.length} articles to analyze`)

  const results = {
    processed: 0,
    errors: 0,
    details: [] as any[]
  }

  for (const article of articles) {
    console.group(`📝 Processing: ${article.title}`)
    try {
      const prompt = `Analyze this AI technology article and extract structured information for a learning platform database. Users want to filter between articles they can just read vs. things they can actually experiment with today. \nArticle Title: ${article.title}\nURL: ${article.url}\nPlease respond with a JSON object containing the following fields: { "category": "news|tutorial|research|tool|api|dataset", "practicalLevel": "news_only|beginner_friendly|intermediate|advanced|research_only", "aiTechnologies": ["technology1", "technology2"], "difficulty": "beginner|intermediate|advanced", "timeToExperiment": 30, "hasCode": true, "hasAPI": false, "hasDemo": true, "hasTutorial": false, "requiresPayment": false, "requiresSignup": true, "learningObjectives": ["What users will learn1", "What users will learn2"], "prerequisites": ["Required knowledge1", "Required tool2"], "summary": "2-3 sentence summary of the article", "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"], "tags": ["tag1", "tag2", "tag3"] } Guidelines: - category: What type of content this is - practicalLevel: How hands-on this content is - "news_only": Just announcements, no way to try it - "beginner_friendly": Can try it easily today with basic setup - "intermediate": Requires some technical knowledge/setup - "advanced": Requires significant expertise - "research_only": Academic/theoretical, not practically accessible yet - timeToExperiment: Estimated minutes needed to try this out (0 if not practical) - aiTechnologies: Specific AI technologies, models, or frameworks mentioned - All boolean fields should reflect what's actually available in the article - learningObjectectives: What someone would actually learn by engaging with this - prerequisites: What knowledge/tools someone needs before starting - tags: Relevant searchable keywords Focus on practical accessibility - can someone actually DO something with this information today?`

      console.info('Sending to Mistral for analysis...')
      const response = await mistral.chat.complete({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an AI analysis assistant that extracts structured information from articles. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        maxTokens: 2000
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('Unexpected response format from AI');
      }

      let analysis = parseAIResponse(response.choices[0].message.content.toString().trim());

      // If parsing fails, try to clean the response and parse again
      if (!analysis) {
        const retryPrompt = `Analyze this AI technology article and return ONLY a JSON object, no other text or formatting. Do not include any markdown formatting or explanatory text.\nArticle Title: ${article.title}\nURL: ${article.url}\nReturn a JSON object with these exact fields: { "category": "news|tutorial|research|tool|api|dataset", "practicalLevel": "news_only|beginner_friendly|intermediate|advanced|research_only", "aiTechnologies": ["technology1", "technology2"], "difficulty": "beginner|intermediate|advanced", "timeToExperiment": 30, "hasCode": true, "hasAPI": false, "hasDemo": true, "hasTutorial": false, "requiresPayment": false, "requiresSignup": true, "learningObjectives": ["What users will learn1", "What users will learn2"], "prerequisites": ["Required knowledge1", "Required tool2"], "summary": "2-3 sentence summary of the article", "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"], "tags": ["tag1", "tag2", "tag3"] }`

        const retryResponse = await mistral.chat.complete({
          model: 'mistral-small-latest',
          messages: [
            {
              role: 'system',
              content: 'You are an AI analysis assistant. Respond with clean JSON only, no markdown formatting or extra text.'
            },
            {
              role: 'user',
              content: retryPrompt
            }
          ],
          temperature: 0.1,
          maxTokens: 2000
        });

        if (!retryResponse.choices?.[0]?.message?.content) {
          throw new Error('Unexpected response format from AI on retry');
        }

        const retryContent = retryResponse.choices[0].message.content.toString().trim();
        console.debug('Retry response:', retryContent);
        
        try {
          analysis = parseAIResponse(retryContent);
        } catch (parseError) {
          console.error('Failed to parse retry response:', parseError);
          console.debug('Raw retry content:', retryContent);
          throw new Error('Failed to parse AI response after retry');
        }
      }

      // Update the article with the AI analysis
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          ai_category: analysis.category,
          ai_practical_level: analysis.practicalLevel,
          ai_technologies: analysis.aiTechnologies,
          ai_difficulty: analysis.difficulty,
          ai_time_to_experiment: analysis.timeToExperiment,
          ai_has_code: analysis.hasCode,
          ai_has_api: analysis.hasAPI,
          ai_has_demo: analysis.hasDemo,
          ai_has_tutorial: analysis.hasTutorial,
          ai_requires_payment: analysis.requiresPayment,
          ai_requires_signup: analysis.requiresSignup,
          ai_learning_objectives: analysis.learningObjectives,
          ai_prerequisites: analysis.prerequisites,
          ai_summary: analysis.summary,
          ai_key_takeaways: analysis.keyTakeaways,
          ai_tags: analysis.tags,
          ai_analyzed_at: new Date().toISOString()
        })
        .eq('id', article.id)

      if (updateError) throw updateError

      results.processed++
      results.details.push({
        id: article.id,
        title: article.title,
        status: 'success'
      })

      console.log('✅ Successfully enriched article')
      console.log(`   - Category: ${analysis.category}`)
      console.log(`   - Technologies: ${analysis.aiTechnologies.join(', ')}`)
      console.log(`   - Practical Level: ${analysis.practicalLevel}`)
    } catch (error) {
      results.errors++
      results.details.push({
        id: article.id,
        title: article.title,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error('❌ Error enriching article:', error)
    }
    console.groupEnd()
  }

  console.log('✨ AI Enrichment completed')
  console.log(`   - Processed: ${results.processed} articles`)
  console.log(`   - Errors: ${results.errors} articles`)
  console.groupEnd()

  return results
} 