//"use client"

import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { generatePlaceholderImage } from '@/lib/placeholderImage'

interface Article {
  id: string
  title: string
  content: string
  url: string
  published_at: string
  author: string
  is_important: boolean
  rss_feeds: {
    name: string
    description: string
    category: string
  }
  ai_learn_more?: string | null
  image_url?: string
}

async function getArticle(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      rss_feeds (
        name,
        description,
        category
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }

  return data
}

async function getRelatedArticles(article: Article): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      rss_feeds (
        name,
        description,
        category
      )
    `)
    .eq('rss_feeds.category', article.rss_feeds.category)
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching related articles:', error)
    return []
  }

  return data
}

const PROMPT_TOOLS = [
  { name: 'Gemini', url: 'https://gemini.google.com/app' },
  { name: 'ChatGPT', url: 'https://chat.openai.com/' },
  { name: 'Mistral', url: 'https://chat.mistral.ai/' },
  { name: 'Claude', url: 'https://claude.ai/' },
];

const PROMPT_TOOL_ICONS: Record<string, React.ReactNode> = {
  Gemini: (
    <img
      src="/gemini.svg"
      alt="Gemini Logo"
      className="w-6 h-6 mr-2 inline-block align-middle"
    />
  ),
  ChatGPT: (
    <img
      src="/chatgpt.svg"
      alt="ChatGPT Logo"
      className="w-6 h-6 mr-2 inline-block align-middle"
    />
  ),
  Mistral: (
    <img
      src="/mistral.svg"
      alt="Mistral Logo"
      className="w-6 h-6 mr-2 inline-block align-middle"
    />
  ),
  Claude: (
    <img
      src="/claude.svg"
      alt="Claude Logo"
      className="w-6 h-6 mr-2 inline-block align-middle"
    />
  ),
};

function CopyableCodeBlock({ children, tool }: { children: React.ReactNode, tool?: string }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).trim();
  return (
    <div className="relative group">
      <pre className="overflow-x-auto !bg-gray-900 !text-gray-100 rounded p-4">
        <code className="!text-gray-100">{code}</code>
      </pre>
      <button
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-opacity opacity-80 group-hover:opacity-100"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          if (tool && PROMPT_TOOLS.find(t => t.name === tool)) {
            window.open(PROMPT_TOOLS.find(t => t.name === tool)?.url, '_blank');
          }
          setTimeout(() => setCopied(false), 1500);
        }}
        type="button"
        title={tool ? "This prompt will be copied to your clipboard and the respective tool opened in a new tab. Simply paste the prompt and off you go!" : "This prompt will be copied to your clipboard."}
      >
        {copied ? 'Copied!' : (tool ? 'Copy prompt to clipboard and launch tool' : 'Copy prompt to clipboard')}
      </button>
    </div>
  );
}

// Custom renderer to track the last heading and pass tool name to code blocks
function MarkdownWithToolCopy({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        code(props: any) {
          const { node, inline, className, children } = props;
          let tool;
          if (!inline && node && node.parent && Array.isArray(node.parent.children)) {
            const idx = node.parent.children.indexOf(node);
            // Walk backwards to find the nearest heading
            for (let i = idx - 1; i >= 0; i--) {
              const prev = node.parent.children[i];
              if (prev.type === 'heading' && prev.children && prev.children.length > 0) {
                // Join all text nodes in the heading
                const heading = prev.children.map((c: any) => c.value || '').join('').replace(/:$/, '');
                if (PROMPT_TOOLS.find(t => t.name === heading)) {
                  tool = heading;
                }
                break;
              }
            }
          }
          if (inline) {
            return <code className={className}>{children}</code>;
          }
          return <CopyableCodeBlock tool={tool}>{children}</CopyableCodeBlock>;
        },
        h2({ children }) { return <h2>{children}</h2>; },
        h3({ children }) { return <h3>{children}</h3>; },
        h4({ children }) { return <h4>{children}</h4>; },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false);

  useEffect(() => {
    async function fetchData() {
      if (isFetching.current) return; // Prevent double call
      isFetching.current = true;
      setLoading(true)
      setError(null)
      const art = await getArticle(params.id)
      if (!art) {
        setError('Article not found')
        setLoading(false)
        isFetching.current = false;
        return
      }
      setArticle(art)
      // Fetch enrichment from API (always, to get latest)
      try {
        const res = await fetch(`/api/articles/${params.id}/learn-more`, { method: 'POST' })
        const data = await res.json()
        if (data.success && data.markdown) {
          setMarkdown(data.markdown)
          setPrompts(data.prompts)
        } else {
          setError('Failed to generate AI enrichment')
        }
      } catch (err) {
        setError('Failed to generate AI enrichment')
      } finally {
        setLoading(false)
        isFetching.current = false;
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse text-center py-16 text-gray-500">Loading article details...</div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600 py-16">{error || 'Article not found.'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to News Feed
        </Link>
      </div>

      {article && (
        <div className="mb-8">
          <img
            src={article.image_url || generatePlaceholderImage(article.id, 800, 300)}
            alt="Article banner"
            className="w-full h-64 object-cover rounded-lg bg-gray-100"
          />
        </div>
      )}

      <article className="prose prose-lg max-w-none">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              {article.rss_feeds.name}
            </span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(article.published_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          {article.author && (
            <p className="text-gray-600">By {article.author}</p>
          )}
        </header>

        <div
          className="mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="border-t pt-8">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Read original article
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </article>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">AI Learning Assistant</h2>
        {markdown ? (
          <div className="prose max-w-none bg-gray-50 border border-gray-200 rounded-lg p-6 w-full text-gray-900">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500">No AI enrichment available.</div>
        )}
        {prompts && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Prompts for AI Assistants</h3>
            <div className="space-y-8">
              {PROMPT_TOOLS.map(tool => (
                prompts[tool.name] ? (
                  <div key={tool.name} className="flex flex-col gap-2">
                    <div className="flex items-center mb-2">
                      {PROMPT_TOOL_ICONS[tool.name]}
                      <span className="font-semibold text-lg">{tool.name}</span>
                    </div>
                    <CopyableCodeBlock tool={tool.name}>{prompts[tool.name]}</CopyableCodeBlock>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 