-- Add more RSS feeds
INSERT INTO rss_feeds (name, url, description, category) VALUES
    ('Machine Learning Mastery', 'https://machinelearningmastery.com/blog/feed/', 'Practical machine learning tutorials and guides', 'AI'),
    ('AWS Machine Learning Blog', 'https://aws.amazon.com/blogs/machine-learning/feed/', 'AWS machine learning services and best practices', 'AI'),
    ('Paperspace Blog', 'https://blog.paperspace.com/feed', 'Cloud computing and machine learning platform updates', 'AI')
ON CONFLICT (url) DO NOTHING; 