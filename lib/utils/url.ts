/**
 * URL utility functions for handling environment-specific URLs
 */

/**
 * Get the base URL for the application
 * Handles localhost, Vercel deployments, and custom domains
 */
export function getBaseUrl(): string {
  // In browser, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Check for Vercel URL (preview deployments)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // Check for configured site URL (production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Check for configured app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Default to localhost for development
  return 'http://localhost:3000'
}

/**
 * Get the authentication callback URL
 * Used for email confirmations and OAuth redirects
 */
export function getAuthCallbackUrl(path: string = '/auth/callback'): string {
  const baseUrl = getBaseUrl()
  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}

/**
 * Get the email confirmation URL
 * Used specifically for email confirmation redirects
 */
export function getEmailConfirmationUrl(): string {
  return getAuthCallbackUrl('/auth/confirm')
}

/**
 * Check if we're in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || getBaseUrl().includes('localhost')
}

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' && !getBaseUrl().includes('localhost')
}