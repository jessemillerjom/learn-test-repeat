import { AuthForm } from '@/components/auth/AuthForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <img 
            src="/full_logo.svg"
            alt="Learn Test Repeat full logo"
            className="h-20 w-auto"
            style={{ maxWidth: '300px' }}
          />
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Learn Test Repeat to start your learning journey
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  )
} 