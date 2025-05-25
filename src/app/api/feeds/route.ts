import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all RSS feeds from the database
    const { data: feeds, error } = await supabase
      .from('rss_feeds')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      feeds,
      total: feeds.length
    })
  } catch (error) {
    console.error('Error fetching RSS feeds:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 