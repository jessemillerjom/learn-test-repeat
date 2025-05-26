-- Create user_libraries table
CREATE TABLE IF NOT EXISTS user_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Add RLS policies
ALTER TABLE user_libraries ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own library entries
CREATE POLICY "Users can view their own library entries" ON user_libraries
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own library entries
CREATE POLICY "Users can add articles to their library" ON user_libraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own library entries
CREATE POLICY "Users can remove articles from their library" ON user_libraries
  FOR DELETE USING (auth.uid() = user_id); 