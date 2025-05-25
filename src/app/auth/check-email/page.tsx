'use client';

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-blue-600">Check your email</h2>
        <p className="text-gray-700 mt-4">
          We've sent a confirmation link to your email address.<br />
          Please check your inbox and click the link to confirm your account.
        </p>
      </div>
    </div>
  );
} 