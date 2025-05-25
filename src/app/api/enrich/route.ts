import { NextResponse } from 'next/server'
import { enrichUnanalyzedArticles } from '@/lib/enrich'

export async function POST() {
  try {
    const results = await enrichUnanalyzedArticles()
    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('❌ Error in enrich endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 