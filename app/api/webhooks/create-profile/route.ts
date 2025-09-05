import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Webhook handler for creating user profiles when a new user signs up
// This should be called from a Supabase Database Webhook
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (recommended for security)
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (webhookSecret) {
      const providedSecret = request.headers.get('authorization')?.replace('Bearer ', '')
      if (providedSecret !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Parse webhook payload
    const payload = await request.json()
    console.log('Webhook payload received:', payload)

    // Extract user data from the webhook
    const userData = payload.record || payload
    if (!userData || !userData.id || !userData.email) {
      console.error('Invalid webhook payload:', payload)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Create profile for the new user
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
        email: userData.email,
        full_name: userData.raw_user_meta_data?.full_name || userData.email?.split('@')[0] || null,
        avatar_url: userData.raw_user_meta_data?.avatar_url || null,
        theme_preference: 'system'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      
      // Check if profile already exists (not an error in this case)
      if (error.code === '23505') { // Unique constraint violation
        console.log('Profile already exists for user:', userData.id)
        return NextResponse.json({ 
          message: 'Profile already exists',
          user_id: userData.id 
        })
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Profile created successfully:', profile)
    return NextResponse.json({ 
      message: 'Profile created successfully',
      profile 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Create profile webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
