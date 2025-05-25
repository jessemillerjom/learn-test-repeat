INSERT INTO rss_feeds (name, url, description, category)
VALUES (
  'Artificial Intelligence Blog & News',
  'https://www.artificial-intelligence.blog/ai-news?format=rss',
  'Latest news, trends, and insights from the Artificial Intelligence Blog.',
  'AI'
)
ON CONFLICT (url) DO NOTHING; 