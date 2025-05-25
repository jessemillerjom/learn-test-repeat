-- Create rss_feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rss_feeds_category ON rss_feeds(category);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_last_fetched ON rss_feeds(last_fetched_at);

-- Enable Row Level Security
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to rss_feeds"
    ON rss_feeds FOR SELECT
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rss_feeds_updated_at
    BEFORE UPDATE ON rss_feeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    ('TechCrunch', 'https://techcrunch.com/feed/', 'Latest technology news and startups', 'Technology'),
    ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology, science, art, and culture', 'Technology'),
    ('Wired', 'https://www.wired.com/feed/rss', 'Technology, science, and culture', 'Technology'),
    ('Google AI Blog', 'https://ai.googleblog.com/rss.xml', 'Latest developments in AI from Google', 'AI'),
    ('Nvidia AI Blog', 'https://blogs.nvidia.com/blog/category/deep-learning/feed/', 'AI and deep learning news from Nvidia', 'AI'),
    ('Towards Data Science', 'https://towardsdatascience.com/feed', 'Data science and machine learning articles', 'AI'),
    ('Machine Learning Mastery', 'https://machinelearningmastery.com/blog/feed/', 'Practical machine learning tutorials and guides', 'AI'),
    ('AWS Machine Learning Blog', 'https://aws.amazon.com/blogs/machine-learning/feed/', 'AWS machine learning services and best practices', 'AI'),
    ('Paperspace Blog', 'https://blog.paperspace.com/feed', 'Cloud computing and machine learning platform updates', 'AI')
ON CONFLICT (url) DO NOTHING; 