export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      technologies: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_technologies: {
        Row: {
          id: string
          user_id: string
          technology_id: string
          proficiency_level: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          technology_id: string
          proficiency_level: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          technology_id?: string
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
      }
      learning_resources: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          resource_type: 'article' | 'video' | 'course' | 'book' | 'documentation'
          technology_id: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url: string
          resource_type: 'article' | 'video' | 'course' | 'book' | 'documentation'
          technology_id: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          resource_type?: 'article' | 'video' | 'course' | 'book' | 'documentation'
          technology_id?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          updated_at?: string
        }
      }
      project_suggestions: {
        Row: {
          id: string
          title: string
          description: string | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_time: string | null
          technology_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_time?: string | null
          technology_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_time?: string | null
          technology_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      news_feed_items: {
        Row: {
          id: string
          title: string
          content: string
          source_url: string | null
          technology_id: string
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          source_url?: string | null
          technology_id: string
          published_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          source_url?: string | null
          technology_id?: string
          published_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 