"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase, hasSeenAboutModal, markAboutModalSeen, fetchRssFeeds } from '@/lib/supabase'

interface RssFeed {
  name: string;
  url: string;
}

export function Navbar() {
  const { user, signOut } = useAuth()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([])

  // Check if user has seen the About modal on first login
  useEffect(() => {
    const checkAboutModal = async () => {
      if (user) {
        const hasSeen = await hasSeenAboutModal()
        if (!hasSeen) {
          setAboutOpen(true)
          await markAboutModalSeen()
        }
      }
    }
    checkAboutModal()
  }, [user])

  // Fetch RSS feeds when modal opens
  useEffect(() => {
    const loadRssFeeds = async () => {
      if (aboutOpen) {
        const feeds = await fetchRssFeeds()
        setRssFeeds(feeds)
      }
    }
    loadRssFeeds()
  }, [aboutOpen])

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-900">Learn Test Repeat</span>
            </Link>
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="ml-3 px-3 py-1 rounded-full bg-blue-600 text-white dark:text-gray-100 text-xs font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="About this project"
            >
              About
            </button>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 dark:text-gray-900 hover:text-gray-900 dark:hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* About Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-[70%] max-w-4xl relative animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-8 overflow-y-auto">
              <button
                onClick={() => setAboutOpen(false)}
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-100 text-xl font-bold focus:outline-none"
                aria-label="Close About modal"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-4 text-blue-700">About Learn Test Repeat</h2>
              <p className="mb-6 text-gray-700 text-lg">
                Learn Test Repeat is a platform for discovering, filtering, and exploring the latest AI and technology articles. It automatically aggregates news and tutorials from top sources, enriches them with AI-powered analysis, and helps users find content they can read or experiment with hands-on.
              </p>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Key features:</h3>
                <ul className="text-gray-700 list-none space-y-2 text-lg">
                  <li>• Aggregates articles from curated RSS feeds</li>
                  <li>• AI-powered enrichment using Mistral AI</li>
                  <li>• Recommended articles that are good for hands-on experimentation</li>
                  <li>• Filter by date, difficulty, practical level, and category</li>
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Stack details:</h3>
                <ul className="text-gray-700 list-none space-y-2 text-lg">
                  <li>• Modern, responsive UI with Next.js, React, and Tailwind CSS</li>
                  <li>• Supabase for authentication and data storage</li>
                  <li>• Front end service by Vercel</li>
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">RSS feeds included:</h3>
                <ul className="text-gray-700 list-none space-y-2 text-lg">
                  {rssFeeds.map((feed) => (
                    <li key={feed.url} className="flex items-center">
                      <span className="mr-2">•</span>
                      <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {feed.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <p className="text-gray-600 text-base text-center">
                Built by Jesse Miller. Open source and extensible for the learning community. See project in{' '}
                <a 
                  href="https://github.com/jessemillerjom/learn-test-repeat/tree/main" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Github
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 