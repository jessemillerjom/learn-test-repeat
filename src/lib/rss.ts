import { supabase } from './supabase'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns'
import Parser from 'rss-parser'

const parser = new Parser()

export interface Article {
  id: number
  title: string
  description: string
  content: string
  url: string
  image_url: string | null
  published_at: string
  source_name: string
  source_url: string
  created_at: string
  updated_at: string
  // AI Analysis fields
  ai_category?: string
  ai_practical_level?: string
  ai_technologies?: string[]
  ai_difficulty?: string
  ai_time_to_experiment?: number
  ai_has_code?: boolean
  ai_has_api?: boolean
  ai_has_demo?: boolean
  ai_has_tutorial?: boolean
  ai_requires_payment?: boolean
  ai_requires_signup?: boolean
  ai_learning_objectives?: string[]
  ai_prerequisites?: string[]
  ai_summary?: string
  ai_key_takeaways?: string[]
  ai_tags?: string[]
  ai_analyzed_at?: string
}

export type DateRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days'

export interface GetArticlesOptions {
  dateRange?: DateRange
  page?: number
  itemsPerPage?: number
  practicalLevel?: string
  showAnalyzedOnly?: boolean
  difficulty?: string
  category?: string
}

export async function fetchAndStoreFeeds() {
  try {
    // Get all RSS feeds from the database
    const { data: feeds, error: feedsError } = await supabase
      .from('rss_feeds')
      .select('*')

    if (feedsError) throw feedsError

    console.group('📰 Feed Refresh Started')
    console.info(`Processing ${feeds.length} sources...`)

    for (const feed of feeds) {
      console.group(`📡 ${feed.name}`)
      console.info(`URL: ${feed.url}`)
      let newArticlesCount = 0
      
      try {
        const feedContent = await parser.parseURL(feed.url)
        console.info(`Found ${feedContent.items.length} items`)
        
        for (const item of feedContent.items) {
          // Check if article already exists
          const { data: existingArticle, error: checkError } = await supabase
            .from('articles')
            .select('id')
            .eq('url', item.link)
            .single()

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error(`Error checking for existing article:`, checkError)
            continue
          }

          if (!existingArticle) {
            // Insert new article
            const { error: insertError } = await supabase.from('articles').insert({
              title: item.title,
              description: item.contentSnippet || item.content,
              content: item.content,
              url: item.link,
              image_url: item.enclosure?.url || null,
              published_at: item.isoDate || new Date().toISOString(),
              source_name: feed.name,
              source_url: feed.url,
              feed_id: feed.id
            })

            if (insertError) {
              console.error(`Error inserting article "${item.title}":`, insertError)
            } else {
              newArticlesCount++
            }
          }
        }

        // Update last_fetched_at timestamp
        const { error: updateError } = await supabase
          .from('rss_feeds')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', feed.id)

        if (updateError) {
          console.error(`Error updating last_fetched_at for ${feed.name}:`, updateError)
        }

        console.log(`✅ Successfully processed ${feed.name}:`)
        console.log(`   - Added ${newArticlesCount} new articles`)
        console.log(`   - Updated last_fetched_at timestamp`)
      } catch (error) {
        console.error(`❌ Error processing ${feed.name}:`, error)
      }
      console.groupEnd()
    }

    console.log('✨ Feed refresh completed')
    console.groupEnd()
    return { success: true, message: 'Feeds fetched and stored successfully' }
  } catch (error) {
    console.error('❌ Error fetching RSS feeds:', error)
    throw error
  }
}

export async function getLatestArticles(options: GetArticlesOptions = {}) {
  const {
    dateRange = 'today',
    page = 1,
    itemsPerPage = 10,
    practicalLevel,
    showAnalyzedOnly = false,
    difficulty,
    category
  } = options

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .not('ai_technologies', 'is', null)  // Ensure ai_technologies is not null
    .not('ai_technologies', 'eq', '{}')  // Ensure ai_technologies is not an empty array

  // Apply practical level filter if specified
  if (practicalLevel && practicalLevel !== 'all') {
    query = query.eq('ai_practical_level', practicalLevel)
  }

  // Apply difficulty filter if specified
  if (difficulty && difficulty !== 'all') {
    query = query.eq('ai_difficulty', difficulty)
  }

  // Apply category filter if specified
  if (category && category !== 'all') {
    query = query.eq('ai_category', category)
  }

  // Apply date range filter
  const now = new Date()
  // Get UTC start and end of day
  const utcStartOfDay = startOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())))
  const utcEndOfDay = endOfDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())))
  switch (dateRange) {
    case 'today':
      query = query
        .gte('published_at', utcStartOfDay.toISOString())
        .lte('published_at', utcEndOfDay.toISOString())
      break
    case 'yesterday':
      const yesterday = subDays(now, 1)
      const utcStartOfYesterday = startOfDay(new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate())))
      const utcEndOfYesterday = endOfDay(new Date(Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate())))
      query = query
        .gte('published_at', utcStartOfYesterday.toISOString())
        .lte('published_at', utcEndOfYesterday.toISOString())
      break
    case 'last_7_days':
      const sevenDaysAgo = subDays(now, 7)
      const utcStartOf7 = startOfDay(new Date(Date.UTC(sevenDaysAgo.getUTCFullYear(), sevenDaysAgo.getUTCMonth(), sevenDaysAgo.getUTCDate())))
      query = query
        .gte('published_at', utcStartOf7.toISOString())
        .lte('published_at', utcEndOfDay.toISOString())
      break
    case 'last_30_days':
      const thirtyDaysAgo = subDays(now, 30)
      const utcStartOf30 = startOfDay(new Date(Date.UTC(thirtyDaysAgo.getUTCFullYear(), thirtyDaysAgo.getUTCMonth(), thirtyDaysAgo.getUTCDate())))
      query = query
        .gte('published_at', utcStartOf30.toISOString())
        .lte('published_at', utcEndOfDay.toISOString())
      break
  }

  // Apply pagination
  const from = (page - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  const { data: articles, error, count } = await query
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching articles:', error)
    throw error
  }

  return {
    articles: articles || [],
    total: count || 0
  }
} 