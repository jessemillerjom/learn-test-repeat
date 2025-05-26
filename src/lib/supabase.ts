import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import type { Article } from '../types/article'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Check if an article is in the user's library
export async function isArticleInLibrary(articleId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_libraries')
    .select('id')
    .eq('article_id', articleId)
    .maybeSingle();
  if (error) {
    console.error('Error checking library status:', error);
    return false;
  }
  return !!data;
}

// Add an article to the user's library
export async function addToLibrary(articleId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not authenticated');
    return false;
  }
  const { error } = await supabase
    .from('user_libraries')
    .insert({ article_id: articleId, user_id: user.id });
  if (error) {
    console.error('Error adding to library:', error);
    return false;
  }
  return true;
}

// Remove an article from the user's library
export async function removeFromLibrary(articleId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Not authenticated');
    return false;
  }
  const { error } = await supabase
    .from('user_libraries')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', user.id);
  if (error) {
    console.error('Error removing from library:', error);
    return false;
  }
  return true;
}

// Fetch paginated articles from the user's library
export async function fetchLibraryArticles(page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const { data, error, count } = await supabase
    .from('user_libraries')
    .select('article_id, created_at, articles(*)', { count: 'exact' })
    .range(start, start + pageSize - 1)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching library articles:', error);
    return { articles: [], total: 0 };
  }
  // Type assertion to help TypeScript understand the structure
  type LibraryItem = {
    article_id: string;
    created_at: string;
    articles: Article[];
  };
  
  return {
    articles: (data as LibraryItem[]).flatMap(item =>
      item.articles?.[0] && item.articles[0].id && item.articles[0].title
        ? [{ ...item.articles[0], library_created_at: item.created_at }]
        : []
    ),
    total: count || 0
  };
}

// Check if user has seen the About modal
export async function hasSeenAboutModal(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('has_seen_about')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If no record exists, create one
    if (error.code === 'PGRST116') {
      await markAboutModalSeen();
      return false;
    }
    console.error('Error checking about modal status:', error);
    return false;
  }

  return data?.has_seen_about ?? false;
}

// Mark that user has seen the About modal
export async function markAboutModalSeen(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      has_seen_about: true
    });

  if (error) {
    console.error('Error marking about modal as seen:', error);
    return false;
  }

  return true;
}

// Fetch all RSS feeds
export async function fetchRssFeeds() {
  const { data, error } = await supabase
    .from('rss_feeds')
    .select('name, url')
    .order('name');
  
  if (error) {
    console.error('Error fetching RSS feeds:', error);
    return [];
  }
  
  return data;
} 