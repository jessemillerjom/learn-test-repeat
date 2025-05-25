-- Add AI Analysis columns to articles table
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

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_category ON articles(ai_category);
CREATE INDEX IF NOT EXISTS idx_articles_ai_practical_level ON articles(ai_practical_level);
CREATE INDEX IF NOT EXISTS idx_articles_ai_difficulty ON articles(ai_difficulty);
CREATE INDEX IF NOT EXISTS idx_articles_ai_tags ON articles USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_articles_ai_technologies ON articles USING GIN(ai_technologies); 