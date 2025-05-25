-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- AI Analysis fields
    ai_category TEXT,
    ai_practical_level TEXT,
    ai_technologies TEXT[],
    ai_difficulty TEXT,
    ai_time_to_experiment INTEGER,
    ai_has_code BOOLEAN,
    ai_has_api BOOLEAN,
    ai_has_demo BOOLEAN,
    ai_has_tutorial BOOLEAN,
    ai_requires_payment BOOLEAN,
    ai_requires_signup BOOLEAN,
    ai_learning_objectives TEXT[],
    ai_prerequisites TEXT[],
    ai_summary TEXT,
    ai_key_takeaways TEXT[],
    ai_tags TEXT[],
    ai_analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Create index on published_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Create index on url for efficient uniqueness checks
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- Create index on source_name for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_source_name ON articles(source_name);

-- Create index on ai_category for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_category ON articles(ai_category);

-- Create index on ai_practical_level for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_practical_level ON articles(ai_practical_level);

-- Create index on ai_difficulty for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_difficulty ON articles(ai_difficulty);

-- Create index on ai_tags for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_tags ON articles USING GIN(ai_tags);

-- Create index on ai_technologies for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_ai_technologies ON articles USING GIN(ai_technologies);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 