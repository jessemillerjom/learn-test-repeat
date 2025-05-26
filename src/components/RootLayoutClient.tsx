"use client"

import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

// Suppress Next.js params warning in development
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('A param property was accessed directly with `params.id`')
    ) {
      // Suppress this warning
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen bg-gray-50 text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </AuthProvider>
  );
} 