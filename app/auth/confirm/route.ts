import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL('/login?error=missing_token', request.url)
    )
  }

  const supabase = await createClient()

  // Verify the OTP token
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as any,
  })

  if (error) {
    console.error('Email confirmation error:', error)
    // Redirect to login with error message
    return NextResponse.redirect(
      new URL(`/login?error=confirmation_failed&message=${encodeURIComponent(error.message)}`, request.url)
    )
  }

  // Email confirmed successfully, redirect to login with success message
  return NextResponse.redirect(
    new URL('/login?confirmed=true&message=Email+confirmed+successfully.+You+can+now+log+in.', request.url)
  )
}