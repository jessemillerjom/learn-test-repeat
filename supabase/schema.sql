-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create technologies table
CREATE TABLE technologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_technologies table (junction table for user interests)
CREATE TABLE user_technologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, technology_id)
);

-- Create learning_resources table
CREATE TABLE learning_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    resource_type TEXT CHECK (resource_type IN ('article', 'video', 'course', 'book', 'documentation')),
    technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_suggestions table
CREATE TABLE project_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT,
    technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create news_feed_items table
CREATE TABLE news_feed_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
-- Technologies: Anyone can read, only authenticated users can create
CREATE POLICY "Technologies are viewable by everyone" ON technologies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create technologies" ON technologies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Technologies: Users can only see and modify their own
CREATE POLICY "Users can view their own technologies" ON user_technologies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own technologies" ON user_technologies
    FOR ALL USING (auth.uid() = user_id);

-- Learning Resources: Anyone can read, only authenticated users can create
CREATE POLICY "Learning resources are viewable by everyone" ON learning_resources
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create learning resources" ON learning_resources
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Project Suggestions: Anyone can read, only authenticated users can create
CREATE POLICY "Project suggestions are viewable by everyone" ON project_suggestions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create project suggestions" ON project_suggestions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- News Feed Items: Anyone can read, only authenticated users can create
CREATE POLICY "News feed items are viewable by everyone" ON news_feed_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create news feed items" ON news_feed_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable RLS on all tables
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feed_items ENABLE ROW LEVEL SECURITY; 