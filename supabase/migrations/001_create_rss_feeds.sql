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
    description TEXT,
    url TEXT NOT NULL UNIQUE,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_name TEXT,
    source_url TEXT,
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
    ai_analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    ('TechCrunch', 'https://techcrunch.com/feed/', 'Latest technology news and startups', 'Technology'),
    ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology, science, art, and culture', 'Technology'),
    ('Wired', 'https://www.wired.com/feed/rss', 'Technology, science, and culture', 'Technology'),
    ('MIT Technology Review - AI', 'https://www.technologyreview.com/feed/', 'Covers breakthroughs in machine learning, robotics, and AI ethics', 'AI'),
    ('OpenAI Blog', 'https://openai.com/blog/rss/', 'Updates on latest AI research and applications', 'AI'),
    ('Google AI Blog', 'https://ai.googleblog.com/feeds/posts/default', 'Updates on Google''s AI research and tools', 'AI'),
    ('AI Trends', 'https://www.aitrends.com/feed/', 'Business and enterprise side of AI', 'AI'),
    ('Nvidia AI Blog', 'https://blogs.nvidia.com/blog/category/ai/feed/', 'Innovations in AI hardware and software', 'AI'),
    ('Towards Data Science', 'https://towardsdatascience.com/feed', 'Articles on AI, data science, and analytics', 'AI'),
    ('AI Weekly', 'https://aiweekly.co/rss', 'Curated AI news and research', 'AI'),
    ('Microsoft AI Blog', 'https://blogs.microsoft.com/ai/feed/', 'Microsoft''s AI research and services', 'AI'),
    ('Machine Learning Mastery', 'https://machinelearningmastery.com/blog/feed/', 'Practical machine learning tutorials and guides', 'AI'),
    ('AWS Machine Learning Blog', 'https://aws.amazon.com/blogs/machine-learning/feed/', 'AWS machine learning services and best practices', 'AI'),
    ('Paperspace Blog', 'https://blog.paperspace.com/feed', 'Cloud computing and machine learning platform updates', 'AI');

-- Create indexes for better query performance
CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_ai_technologies ON articles USING GIN (ai_technologies);

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