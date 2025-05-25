import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MISSING_FEEDS = [
  {
    name: 'MIT Technology Review - AI',
    url: 'https://www.technologyreview.com/feed/',
    description: 'Covers breakthroughs in machine learning, robotics, and AI ethics',
    category: 'AI'
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss/',
    description: 'Updates on latest AI research and applications',
    category: 'AI'
  },
  {
    name: 'AI Trends',
    url: 'https://www.aitrends.com/feed/',
    description: 'Business and enterprise side of AI',
    category: 'AI'
  },
  {
    name: 'AI Weekly',
    url: 'https://aiweekly.co/rss',
    description: 'Curated AI news and research',
    category: 'AI'
  },
  {
    name: 'Microsoft AI Blog',
    url: 'https://blogs.microsoft.com/ai/feed/',
    description: "Microsoft's AI research and services",
    category: 'AI'
  }
]

export async function POST() {
  try {
    const results = []
    for (const feed of MISSING_FEEDS) {
      const { data, error } = await supabase
        .from('rss_feeds')
        .upsert(feed, { onConflict: 'url' })
        .select()
        .single()

      if (error) {
        results.push({ feed, error: error.message })
      } else {
        results.push({ feed, success: true })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error adding feeds:', error)
    return NextResponse.json(
      {
        error: 'Failed to add feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 