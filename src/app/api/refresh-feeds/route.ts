import { NextResponse } from 'next/server'
import { fetchAndStoreFeeds } from '@/lib/rss'

export async function POST() {
  try {
    const result = await fetchAndStoreFeeds()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error refreshing feeds:', error)
    return NextResponse.json(
      { 
        error: 'Failed to refresh feeds',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 