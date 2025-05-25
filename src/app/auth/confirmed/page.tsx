'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmedPage() {
  const router = useRouter();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      router.push('/');
      return;
    }
    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-green-600">Email confirmed!</h2>
        <p className="text-gray-700 mt-4">Redirecting {count}..{count > 1 ? count - 1 : ''}{count > 2 ? '..1' : ''}...</p>
      </div>
    </div>
  );
} 