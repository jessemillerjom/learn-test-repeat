"use client"

import { useEffect, useState } from 'react'
import { getLatestArticles, Article, DateRange, fetchAndStoreFeeds } from '@/lib/rss'
import { supabase } from '@/lib/supabase'
import DateRangePicker from './DateRangePicker'
import Pagination from './Pagination'
import { generatePlaceholderImage } from '@/lib/placeholderImage'
import Link from 'next/link'
import { useMemo } from 'react'
import { isArticleInLibrary, addToLibrary, removeFromLibrary, fetchLibraryArticles } from '@/lib/supabase'
import { Article as ArticleType } from '@/types/article'

const PRACTICAL_LEVELS = [
  { value: 'all', label: 'All' },
  { value: 'news_only', label: 'News Only' },
  { value: 'beginner_friendly', label: 'Beginner Friendly' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'research_only', label: 'Research Only' }
]

const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'All' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'deep_learning', label: 'Deep Learning' },
  { value: 'nlp', label: 'Natural Language Processing' },
  { value: 'computer_vision', label: 'Computer Vision' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'reinforcement_learning', label: 'Reinforcement Learning' },
  { value: 'generative_ai', label: 'Generative AI' },
  { value: 'ai_tools', label: 'AI Tools' },
  { value: 'ai_news', label: 'AI News' }
]

const TABS = [
  { key: 'recommended', label: 'Recommended Articles' },
  { key: 'all', label: 'All Articles' },
  { key: 'library', label: 'My Library' }
]

// ArticleCard component for consistent rendering
function ArticleCard({ article, libraryStatus, toggleLibrary, inLibraryTab = false }: { article: ArticleType, libraryStatus: Record<string, boolean>, toggleLibrary: (id: string) => void, inLibraryTab?: boolean }) {
  const isInLibrary = libraryStatus[article.id];
  return (
    <div key={article.id} className="news-item bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm flex gap-4 items-start">
      <img
        src={article.image_url || generatePlaceholderImage(String(article.id), 80, 80)}
        alt="Article thumbnail"
        className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-gray-100"
      />
      <div className="flex-1">
        <h2 className="article-title text-2xl font-bold text-blue-700 mb-2">
          <Link
            href={`/articles/${article.id}`}
            className="hover:underline"
          >
            {article.title}
          </Link>
        </h2>
        <p className="article-meta text-sm text-gray-500 mb-3">
          <span className="source font-medium">Source: {article.source_name}</span>
          <span className="mx-2">|</span>
          <span className="date">Published: {new Date(article.published_at).toLocaleDateString()}</span>
        </p>
        {article.ai_summary && (
          <p className="summary text-gray-800 mb-2"><span className="font-semibold">Summary:</span> {article.ai_summary}</p>
        )}
        {article.ai_category && (
          <div className="ai-analysis bg-gray-50 border border-gray-100 rounded-md p-4 mb-3">
            <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><span className="text-gray-900">Category:</span> <span className="value font-semibold text-gray-700">{article.ai_category}</span></p>
              <p><span className="text-gray-900">Practical Level:</span> <span className="value font-semibold text-gray-700">{article.ai_practical_level}</span></p>
              <p><span className="text-gray-900">Difficulty:</span> <span className="value font-semibold text-gray-700">{article.ai_difficulty}</span></p>
              <p><span className="text-gray-900">Time to Experiment:</span> <span className="value font-semibold text-gray-700">{article.ai_time_to_experiment} minutes</span></p>
              <p><span className="text-gray-900">Technologies:</span> <span className="value font-semibold text-gray-700">{article.ai_technologies?.join(', ')}</span></p>
              <p><span className="text-gray-900">Has Code:</span> <span className="value font-semibold text-gray-700">{article.ai_has_code ? 'Yes' : 'No'}</span></p>
              <p><span className="text-gray-900">Has API:</span> <span className="value font-semibold text-gray-700">{article.ai_has_api ? 'Yes' : 'No'}</span></p>
              <p><span className="text-gray-900">Has Demo:</span> <span className="value font-semibold text-gray-700">{article.ai_has_demo ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <a
            href={`/articles/${article.id}`}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Learn more
          </a>
          {inLibraryTab && isInLibrary ? (
            <button
              onClick={() => toggleLibrary(article.id)}
              className="ml-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Remove from my library
            </button>
          ) : isInLibrary ? (
            <span className="ml-2 px-4 py-2 text-gray-600">
              ⭐ In my library
            </span>
          ) : (
            <button
              onClick={() => toggleLibrary(article.id)}
              className="ml-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-900 dark:text-gray-900"
            >
              Add to my library
            </button>
          )}
        </div>
        <hr className="divider border-t border-gray-200 mt-6" />
      </div>
    </div>
  );
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<ArticleType[]>([])
  const [recommendedArticles, setRecommendedArticles] = useState<ArticleType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [enrichProgress, setEnrichProgress] = useState<{ processed: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('last_7_days')
  const [practicalLevel, setPracticalLevel] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'library'>('recommended')
  const [currentRecommendedPage, setCurrentRecommendedPage] = useState(1)
  const [libraryArticles, setLibraryArticles] = useState<ArticleType[]>([])
  const [libraryPage, setLibraryPage] = useState(1)
  const [libraryTotal, setLibraryTotal] = useState(0)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [libraryStatus, setLibraryStatus] = useState<Record<string, boolean>>({})

  // Fetch recommended articles
  const fetchRecommendedArticles = async () => {
    try {
      const { articles: data } = await getLatestArticles({
        dateRange: 'last_30_days', // Show from last 30 days for recs
        itemsPerPage: 100, // Arbitrary large number to get all
        practicalLevel: undefined, // We'll filter below
        showAnalyzedOnly: true
      })
      // Filter for recommended criteria
      const recommended = (data || []).filter(
        (a) =>
          (a.ai_has_code || a.ai_has_api || a.ai_has_demo) &&
          ['beginner_friendly', 'intermediate', 'advanced'].includes(a.ai_practical_level)
      )
      // Sort descending by date
      recommended.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      setRecommendedArticles(recommended)
    } catch (err) {
      console.error('Error fetching recommended articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    try {
      const { articles: data, total } = await getLatestArticles({
        dateRange,
        page: currentPage,
        itemsPerPage,
        practicalLevel,
        difficulty,
        category
      })
      setArticles(data)
      setTotalItems(total)
      setError(null)
    } catch (err) {
      setError('Failed to fetch articles')
      console.error('Error fetching articles:', err, JSON.stringify(err));
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await fetch('/api/refresh-feeds', {
        method: 'POST'
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh feeds')
      }
      await fetchArticles()
    } catch (err) {
      setError('Failed to refresh articles')
      console.error('Error refreshing articles:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleEnrich = async () => {
    setEnriching(true)
    setError(null)
    try {
      // First get the count of unanalyzed articles
      const { count } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('ai_analyzed_at', null)

      setEnrichProgress({ processed: 0, total: count || 0 })

      const response = await fetch('/api/enrich', {
        method: 'POST'
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to enrich articles')
      }
      
      // Update progress with results
      setEnrichProgress({
        processed: data.results.processed,
        total: count || 0
      })

      await fetchArticles() // Refresh the articles to show the new AI analysis
    } catch (err) {
      setError('Failed to enrich articles')
      console.error('Error enriching articles:', err)
    } finally {
      setEnriching(false)
      setEnrichProgress(null)
    }
  }

  const handlePracticalLevelChange = (level: string) => {
    setPracticalLevel(level)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setDateRange('last_7_days');
    setDifficulty('all');
    setPracticalLevel('all');
    setCategory('all');
    setCurrentPage(1);
  };

  useEffect(() => {
    if (activeTab === 'all') {
      fetchArticles()
    }
  }, [dateRange, practicalLevel, difficulty, category, currentPage, activeTab])

  useEffect(() => {
    fetchRecommendedArticles()
  }, [])

  useEffect(() => {
    if (activeTab === 'recommended') setCurrentRecommendedPage(1);
  }, [activeTab]);

  // Fetch library articles when the library tab is active
  useEffect(() => {
    if (activeTab === 'library') {
      setLibraryLoading(true);
      fetchLibraryArticles(libraryPage, 10).then(({ articles, total }) => {
        setLibraryArticles(articles as ArticleType[]);
        setLibraryTotal(total);
        setLibraryLoading(false);
      });
    }
  }, [activeTab, libraryPage]);

  useEffect(() => {
    const checkLibraryStatus = async () => {
      const status: Record<string, boolean> = {};
      // Combine all visible articles (avoiding duplicates)
      const allVisible = [
        ...articles,
        ...recommendedArticles.filter(a => !articles.some(b => b.id === a.id))
      ];
      for (const article of allVisible) {
        status[article.id] = await isArticleInLibrary(article.id);
      }
      setLibraryStatus(status);
    };
    checkLibraryStatus();
  }, [articles, recommendedArticles]);

  // Toggle library status for an article
  const toggleLibrary = async (articleId: string) => {
    const isInLibrary = await isArticleInLibrary(articleId);
    if (isInLibrary) {
      await removeFromLibrary(articleId);
    } else {
      await addToLibrary(articleId);
    }
    // Update the libraryStatus state immediately
    setLibraryStatus(prev => ({
      ...prev,
      [articleId]: !isInLibrary
    }));
    // Refresh library articles if on library tab
    if (activeTab === 'library') {
      fetchLibraryArticles(libraryPage, 10).then(({ articles, total }) => {
        setLibraryArticles(articles as ArticleType[]);
        setLibraryTotal(total);
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading articles...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900">News Feed</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'recommended' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 dark:text-gray-900'}`}
            onClick={() => setActiveTab('recommended')}
          >
            Recommended
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 dark:text-gray-900'}`}
            onClick={() => setActiveTab('all')}
          >
            All Articles
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900 dark:text-gray-900'}`}
            onClick={() => setActiveTab('library')}
          >
            My Library
          </button>
        </div>
      </div>

      {/* Only show filters on All Articles tab */}
      {activeTab === 'all' && (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Publish Date */}
            <div className="w-full sm:w-48">
              <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
              <select
                id="date-range"
                value={dateRange}
                onChange={e => setDateRange(e.target.value as DateRange)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7_days">Past 7 days</option>
                <option value="last_30_days">Past 30 days</option>
              </select>
            </div>
            {/* Difficulty */}
            <div className="w-full sm:w-48">
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            {/* Practical Level */}
            <div className="w-full sm:w-48">
              <label htmlFor="practical-level" className="block text-sm font-medium text-gray-700 mb-1">Practical Level</label>
              <select
                id="practical-level"
                value={practicalLevel}
                onChange={e => handlePracticalLevelChange(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {PRACTICAL_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
            {/* Category */}
            <div className="w-full sm:w-48">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
          {(dateRange !== 'last_7_days' || difficulty !== 'all' || practicalLevel !== 'all' || category !== 'all') && (
            <a
              href="#"
              onClick={e => { e.preventDefault(); clearFilters(); }}
              className="text-blue-600 underline hover:text-blue-800 text-sm mt-4 sm:mt-0 sm:ml-4 whitespace-nowrap"
            >
              Clear filters
            </a>
          )}
        </div>
      )}

      {/* Recommended Articles Tab Content */}
      {activeTab === 'recommended' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-900">Recommended Articles</h2>
          {loading ? (
            <div className="animate-pulse text-center py-16 text-gray-500">Loading recommended articles...</div>
          ) : (
            <>
              {recommendedArticles.length === 0 ? (
                <div className="text-gray-500">No recommended articles found.</div>
              ) : (
                <>
                  {recommendedArticles
                    .slice((currentRecommendedPage - 1) * itemsPerPage, currentRecommendedPage * itemsPerPage)
                    .map((article, idx) => (
                      <ArticleCard key={article.id} article={article} libraryStatus={libraryStatus} toggleLibrary={toggleLibrary} />
                    ))
                  }
                  <Pagination
                    currentPage={currentRecommendedPage}
                    totalPages={Math.ceil(recommendedArticles.length / itemsPerPage)}
                    totalItems={recommendedArticles.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentRecommendedPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* All Articles Tab Content */}
      {activeTab === 'all' && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-900">All Articles</h2>
          <div className="news-feed">
            {articles.length === 0 ? (
              <div className="text-center text-gray-600 py-12">
                No articles found for the selected filters.{' '}
                <button
                  onClick={clearFilters}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              articles.map((article) => (
                <ArticleCard key={article.id} article={article} libraryStatus={libraryStatus} toggleLibrary={toggleLibrary} />
              ))
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Library Tab Content */}
      {activeTab === 'library' && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-900">My Library</h2>
          {libraryLoading ? (
            <div className="animate-pulse text-center py-16 text-gray-500">Loading library articles...</div>
          ) : (
            <div className="space-y-8">
              {libraryArticles
                .slice()
                .sort((a, b) => new Date(b.library_created_at).getTime() - new Date(a.library_created_at).getTime())
                .map((article) => (
                  <ArticleCard key={article.id} article={article} libraryStatus={libraryStatus} toggleLibrary={toggleLibrary} inLibraryTab={true} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 