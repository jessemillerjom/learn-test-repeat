"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Learn Test Repeat</span>
            </Link>
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="ml-3 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="text-sm text-gray-700 hover:text-gray-900"
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
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
              aria-label="Close About modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-blue-700">About Learn Test Repeat</h2>
            <p className="mb-4 text-gray-700">
              <strong>Learn Test Repeat</strong> is a platform for discovering, filtering, and exploring the latest AI and technology articles. It automatically aggregates news and tutorials from top sources, enriches them with AI-powered analysis, and helps users find content they can read or experiment with hands-on.
            </p>
            <ul className="mb-4 text-gray-700 list-disc list-inside">
              <li>Aggregates articles from curated RSS feeds</li>
              <li>AI-powered enrichment using Mistral AI</li>
              <li>Filter by date, difficulty, practical level, and category</li>
              <li>Modern, responsive UI with Next.js, React, and Tailwind CSS</li>
              <li>Supabase for authentication and data storage</li>
            </ul>
            <p className="text-gray-600 text-sm">
              Built by Jesse Miller. Open source and extensible for the learning community.
            </p>
          </div>
        </div>
      )}
    </nav>
  )
} 