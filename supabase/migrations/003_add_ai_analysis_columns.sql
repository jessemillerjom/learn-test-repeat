-- Add AI analysis columns to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS ai_category TEXT,
ADD COLUMN IF NOT EXISTS ai_practical_level TEXT,
ADD COLUMN IF NOT EXISTS ai_technologies TEXT[],
ADD COLUMN IF NOT EXISTS ai_difficulty TEXT,
ADD COLUMN IF NOT EXISTS ai_time_to_experiment INTEGER,
ADD COLUMN IF NOT EXISTS ai_has_code BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_has_api BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_has_demo BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_has_tutorial BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_requires_payment BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_requires_signup BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_learning_objectives TEXT[],
ADD COLUMN IF NOT EXISTS ai_prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_key_takeaways TEXT[],
ADD COLUMN IF NOT EXISTS ai_tags TEXT[],
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create index for AI technologies array
CREATE INDEX IF NOT EXISTS idx_articles_ai_technologies ON articles USING GIN (ai_technologies); 