-- First, truncate the rss_feeds table to remove all existing records
TRUNCATE TABLE rss_feeds CASCADE;

-- Add all RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    -- Technology News Sources
    ('TechCrunch', 'https://techcrunch.com/feed/', 'Latest technology news and startups', 'Technology'),
    ('The Verge', 'https://www.theverge.com/rss/index.xml', 'Technology, science, art, and culture', 'Technology'),
    ('Wired', 'https://www.wired.com/feed/rss', 'Technology, science, and culture', 'Technology'),
    
    -- AI Research and News
    ('MIT Technology Review - AI', 'https://www.technologyreview.com/feed/', 'Covers breakthroughs in machine learning, robotics, and AI ethics', 'AI'),
    ('OpenAI Blog', 'https://openai.com/blog/rss.xml', 'Updates on latest AI research and applications', 'AI'),
    ('Google AI Blog', 'https://ai.googleblog.com/rss.xml', 'Updates on Google''s AI research and tools', 'AI'),
    ('AI Trends', 'https://www.aitrends.com/feed/', 'Business and enterprise side of AI', 'AI'),
    ('Towards Data Science', 'https://towardsdatascience.com/feed', 'Articles on AI, data science, and analytics', 'AI'),
    ('Microsoft AI Blog', 'https://blogs.microsoft.com/ai/feed/', 'Microsoft''s AI research and services', 'AI'),
    
    -- AI Learning and Tutorials
    ('Machine Learning Mastery', 'https://machinelearningmastery.com/blog/feed/', 'Practical machine learning tutorials and guides', 'AI'),
    ('AWS Machine Learning Blog', 'https://aws.amazon.com/blogs/machine-learning/feed/', 'AWS machine learning services and best practices', 'AI'),
    ('Paperspace Blog', 'https://blog.paperspace.com/feed', 'Cloud computing and machine learning platform updates', 'AI'); 