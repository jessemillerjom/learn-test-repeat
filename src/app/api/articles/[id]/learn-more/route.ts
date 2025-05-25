import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mistral } from '@/lib/mistral'

function extractFirstJsonObject(str: string) {
  const start = str.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++;
    if (str[i] === '}') depth--;
    if (depth === 0) {
      return str.slice(start, i + 1);
    }
  }
  return null;
}

function splitMarkdownAndJson(response: string) {
  const jsonString = extractFirstJsonObject(response);
  if (!jsonString) {
    return { markdown: response.trim(), prompts: null };
  }
  const markdown = response.slice(0, response.indexOf(jsonString)).trim();
  try {
    // Add double quotes around property names if missing
    let fixedJsonString = jsonString.replace(/([\{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
    const prompts = JSON.parse(fixedJsonString);
    return { markdown, prompts };
  } catch (e) {
    console.error('Error parsing JSON from response:', e);
    console.debug('Raw JSON string:', jsonString);
    return { markdown: response.trim(), prompts: null };
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: articleId } = await context.params;
    console.log('Processing learn-more request for article:', articleId);

    // Fetch the article
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    if (!article) {
      console.error('Article not found:', articleId);
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    if (article.ai_learn_more_markdown && article.ai_learn_more_prompts) {
      console.log('Returning cached learn-more content for article:', articleId);
      return NextResponse.json({ success: true, markdown: article.ai_learn_more_markdown, prompts: article.ai_learn_more_prompts })
    }

    // Build the prompt
    const prompt = `You are an AI learning assistant. A user is interested in the following news article:\n\n---\n${article.url}\n---\n\nBased on this article, please:\n\n1.  **Identify and briefly explain the key AI technologies, concepts, or entities mentioned.** Aim for 2-3 core items. Include links to websites. \n2.  **Suggest two to three actionable steps the user could take to learn more about one or more of these key items hands-on.** These should be specific and achievable for someone looking to experiment. Start each step with an action verb (e.g., "Read...", "Try...", "Explore..."). Include links to websites. \n3.  **Propose one simple project idea that the user could undertake to practice or explore these concepts further.** The project should be relatively small in scope. Provide detailed steps with links on how the user would go about completing this project. Also, generate the prompt that a user can copy and past into a chat prompt to get step-by-step help to complete this simple project. Include prompts for Gemini, ChatGPT, Mistral and Claude. \n\nPlease format your response clearly with numbered lists for the explanations and actionable steps, and a clear heading for the project idea. \n\nWhen providing your response, \n1. Provide everything up to the prompts for the different tools as markdown format. \n2. After your markdown, return a JSON object with the following structure (and nothing else after the markdown):\n\n{\n  "Gemini": "...",\n  "ChatGPT": "...",\n  "Mistral": "...",\n  "Claude": "..."\n}\n\nThe markdown and JSON should be clearly separated. Do not include the chat prompts in the markdown section.`

    console.log('Sending request to Mistral API...');
    console.log('Prompt being sent to Mistral:', prompt);
    const response = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: 'You are a helpful AI learning assistant.' },
        { role: 'user', content: prompt }
      ]
    })

    let content = response.choices && response.choices[0]?.message?.content;
    if (Array.isArray(content)) {
      content = content.join('');
    }
    if (!content) {
      console.error('No content received from Mistral API');
      return NextResponse.json({ success: false, error: 'No content from Mistral' }, { status: 500 })
    }

    console.log('Parsing Mistral response...');
    const { markdown, prompts } = splitMarkdownAndJson(content);

    // Save to DB
    console.log('Saving to database...');
    const { error: updateError } = await supabase
      .from('articles')
      .update({ ai_learn_more_markdown: markdown, ai_learn_more_prompts: prompts })
      .eq('id', articleId)

    if (updateError) {
      console.error('Error saving to database:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to save enrichment' }, { status: 500 })
    }

    console.log('Successfully processed learn-more request for article:', articleId);
    return NextResponse.json({ success: true, markdown, prompts })
  } catch (err) {
    console.error('Error in learn-more endpoint:', err);
    return NextResponse.json({ success: false, error: 'Failed to generate enrichment' }, { status: 500 })
  }
} 