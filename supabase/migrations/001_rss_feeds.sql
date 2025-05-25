-- Create RSS feeds table
CREATE TABLE rss_feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create articles table
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT NOT NULL UNIQUE,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    ('MIT Technology Review - AI', 'https://www.technologyreview.com/feed/', 'Covers breakthroughs in machine learning, robotics, and AI ethics', 'AI'),
    ('OpenAI Blog', 'https://openai.com/blog/rss/', 'Updates on latest AI research and applications', 'AI'),
    ('Google AI Blog', 'https://ai.googleblog.com/feeds/posts/default', 'Updates on Google''s AI research and tools', 'AI'),
    ('AI Trends', 'https://www.aitrends.com/feed/', 'Business and enterprise side of AI', 'AI'),
    ('Nvidia AI Blog', 'https://blogs.nvidia.com/blog/category/ai/feed/', 'Innovations in AI hardware and software', 'AI'),
    ('Towards Data Science', 'https://towardsdatascience.com/feed', 'Articles on AI, data science, and analytics', 'AI'),
    ('AI Weekly', 'https://aiweekly.co/rss', 'Curated AI news and research', 'AI'),
    ('Microsoft AI Blog', 'https://blogs.microsoft.com/ai/feed/', 'Microsoft''s AI research and services', 'AI');

-- Create indexes for better query performance
CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_is_important ON articles(is_important);

-- Enable Row Level Security
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "RSS feeds are viewable by everyone" ON rss_feeds
    FOR SELECT USING (true);

CREATE POLICY "Articles are viewable by everyone" ON articles
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rss_feeds_updated_at
    BEFORE UPDATE ON rss_feeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 