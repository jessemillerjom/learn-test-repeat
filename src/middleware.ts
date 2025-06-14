import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Allow access to public assets
  if (request.nextUrl.pathname.startsWith('/public/')) {
    return response
  }

  // If user is not signed in and trying to access a protected route
  if (
    !session &&
    !request.nextUrl.pathname.startsWith('/auth/') &&
    !request.nextUrl.pathname.startsWith('/api/cron/fetch-feeds') &&
    !request.nextUrl.pathname.startsWith('/api/articles/') &&
    !request.nextUrl.pathname.startsWith('/library') &&
    !request.nextUrl.pathname.startsWith('/api/library')
  ) {
    return response
  }

  // If user is not signed in and trying to access library features
  if (
    !session &&
    (request.nextUrl.pathname.startsWith('/library') ||
     request.nextUrl.pathname.startsWith('/api/library'))
  ) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is signed in and trying to access auth pages
  if (session && request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - favicon.svg (SVG favicon)
     * - public folder
     * - .svg files
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|public/|.*\\.svg$).*)',
  ],
} 