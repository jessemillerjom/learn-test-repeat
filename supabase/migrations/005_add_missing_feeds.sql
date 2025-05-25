-- Add missing RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    ('MIT Technology Review - AI', 'https://www.technologyreview.com/feed/', 'Covers breakthroughs in machine learning, robotics, and AI ethics', 'AI'),
    ('OpenAI Blog', 'https://openai.com/blog/rss/', 'Updates on latest AI research and applications', 'AI'),
    ('AI Trends', 'https://www.aitrends.com/feed/', 'Business and enterprise side of AI', 'AI'),
    ('AI Weekly', 'https://aiweekly.co/rss', 'Curated AI news and research', 'AI'),
    ('Microsoft AI Blog', 'https://blogs.microsoft.com/ai/feed/', 'Microsoft''s AI research and services', 'AI')
ON CONFLICT (url) DO NOTHING; 