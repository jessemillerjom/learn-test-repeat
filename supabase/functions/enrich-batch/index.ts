// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Functions!")

// Helper to parse AI response safely
function parseAIResponse(content: string) {
  try {
    // Remove markdown code block if present
    const cleaned = content.replace(/^```json|```$/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// Call Mistral API using fetch (Deno-compatible)
async function callMistral(prompt: string) {
  const apiKey = Deno.env.get("MISTRAL_API_KEY");
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: "You are an AI analysis assistant that extracts structured information from articles. Respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  // Fetch up to 10 unanalyzed articles
  const { data: articles, error: fetchError } = await supabase
    .from("articles")
    .select("id, title, url")
    .is("ai_analyzed_at", null)
    .order("published_at", { ascending: false })
    .limit(10);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  const results = {
    processed: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const article of articles ?? []) {
    try {
      const prompt = `Analyze this AI technology article and extract structured information for a learning platform database. Users want to filter between articles they can just read vs. things they can actually experiment with today. \nArticle Title: ${article.title}\nURL: ${article.url}\n`;
      let content = await callMistral(prompt);
      let analysis = parseAIResponse(content || "");

      // Retry if parsing fails
      if (!analysis) {
        const retryPrompt = `Analyze this AI technology article and return ONLY a JSON object, no other text or formatting. Do not include any markdown formatting or explanatory text.\nArticle Title: ${article.title}\nURL: ${article.url}\nReturn a JSON object with these exact fields: { \"category\": \"news|tutorial|research|tool|api|dataset\", \"practicalLevel\": \"news_only|beginner_friendly|intermediate|advanced|research_only\", \"aiTechnologies\": [\"technology1\", \"technology2\"], \"difficulty\": \"beginner|intermediate|advanced\", \"timeToExperiment\": 30, \"hasCode\": true, \"hasAPI\": false, \"hasDemo\": true, \"hasTutorial\": false, \"requiresPayment\": false, \"requiresSignup\": true, \"learningObjectives\": [\"What users will learn1\", \"What users will learn2\"], \"prerequisites\": [\"Required knowledge1\", \"Required tool2\"], \"summary\": \"2-3 sentence summary of the article\", \"keyTakeaways\": [\"Key point 1\", \"Key point 2\", \"Key point 3\"], \"tags\": [\"tag1\", \"tag2\", \"tag3\"] }`;
        content = await callMistral(retryPrompt);
        analysis = parseAIResponse(content || "");
      }

      if (!analysis) throw new Error("Failed to parse AI response");

      const { error: updateError } = await supabase
        .from("articles")
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
        .eq("id", article.id);

      if (updateError) throw updateError;

      results.processed++;
      results.details.push({
        id: article.id,
        title: article.title,
        status: "success"
      });
    } catch (error) {
      results.errors++;
      results.details.push({
        id: article.id,
        title: article.title,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/enrich-batch' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
