-- Drop existing articles table and recreate with correct schema
DROP TABLE IF EXISTS articles CASCADE;

CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT NOT NULL UNIQUE,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_name TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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

-- Create indexes for better query performance
CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_ai_technologies ON articles USING GIN(ai_technologies);
CREATE INDEX idx_articles_ai_category ON articles(ai_category);
CREATE INDEX idx_articles_ai_practical_level ON articles(ai_practical_level);
CREATE INDEX idx_articles_ai_difficulty ON articles(ai_difficulty);
CREATE INDEX idx_articles_ai_tags ON articles USING GIN(ai_tags);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies for articles
CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert articles" ON articles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update articles" ON articles
    FOR UPDATE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 