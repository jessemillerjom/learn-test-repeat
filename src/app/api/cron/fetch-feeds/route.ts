import { NextResponse } from 'next/server'
import { fetchAndStoreFeeds } from '@/lib/rss'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Verify the request is from a trusted source (e.g., Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch and store feeds
    const feedResult = await fetchAndStoreFeeds()

    return NextResponse.json({ 
      success: true,
      message: 'Feeds fetched successfully',
      feedResult
    })
  } catch (error) {
    console.error('Error in fetch-feeds cron job:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 