-- Add columns for AI learn more content
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_learn_more_markdown TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_learn_more_prompts JSONB; 