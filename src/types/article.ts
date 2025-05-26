export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  published_at: string;
  author: string;
  is_important: boolean;
  rss_feeds: {
    name: string;
    description: string;
    category: string;
  };
  ai_learn_more?: string | null;
  image_url?: string;
  source_name?: string;
  ai_summary?: string;
  ai_category?: string;
  ai_practical_level?: string;
  ai_difficulty?: string;
  ai_time_to_experiment?: number;
  ai_technologies?: string[];
  ai_has_code?: boolean;
  ai_has_api?: boolean;
  ai_has_demo?: boolean;
  library_created_at?: string;
} 