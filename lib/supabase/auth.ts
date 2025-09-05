import { createClient } from './client'
import { type User } from '@supabase/supabase-js'

// Client-side authentication utilities
export const auth = {
  // Sign up new user
  async signUp(email: string, password: string, options?: { 
    firstName?: string 
    lastName?: string 
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: options?.firstName && options?.lastName 
            ? `${options.firstName} ${options.lastName}` 
            : undefined,
        }
      }
    })

    // If signup successful and user is confirmed, create profile
    if (data.user && !error) {
      try {
        // Only create profile if user is immediately confirmed (email confirmation disabled)
        // For email confirmation flows, this should be handled by webhook or in confirmation page
        if (data.user.email_confirmed_at) {
          await this.createProfile(data.user)
        }
      } catch (profileError) {
        console.warn('Profile creation failed:', profileError)
        // Don't fail the signup if profile creation fails
        // Profile can be created later when user first logs in
      }
    }
    
    return { data, error }
  },

  // Create user profile (internal helper)
  async createProfile(user: User) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        theme_preference: 'system'
      })
      .select()
      .single()
    
    if (error && error.code !== '23505') { // Ignore "already exists" errors
      throw error
    }
    
    return { profile: data, error }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // Ensure profile exists for existing users (fallback mechanism)
    if (data.user && !error) {
      try {
        await this.ensureProfileExists(data.user)
      } catch (profileError) {
        console.warn('Profile check/creation failed:', profileError)
        // Don't fail the signin if profile operations fail
      }
    }
    
    return { data, error }
  },

  // Ensure user profile exists (create if missing)
  async ensureProfileExists(user: User) {
    const supabase = createClient()
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    // If profile doesn't exist, create it
    if (checkError && checkError.code === 'PGRST116') { // No rows returned
      return await this.createProfile(user)
    }
    
    return { profile: existingProfile, error: checkError }
  },

  // Sign out user
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user (client-side)
  async getUser() {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  // Reset password
  async resetPassword(email: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    return { data, error }
  },

  // Update password
  async updatePassword(password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    
    return { data, error }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient()
    
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}


// User profile utilities
export const profile = {
  // Get user profile
  async getProfile(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { profile: data, error }
  },

  // Create user profile (public utility)
  async createProfile(user: User | { id: string; email?: string; user_metadata?: any }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        theme_preference: 'system'
      })
      .select()
      .single()
    
    return { profile: data, error }
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    full_name?: string
    avatar_url?: string
    theme_preference?: 'light' | 'dark' | 'system'
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { profile: data, error }
  },

  // Ensure profile exists for a user
  async ensureProfileExists(userId: string) {
    const { profile: existingProfile, error } = await this.getProfile(userId)
    
    if (error && error.code === 'PGRST116') { // No rows returned
      // Get user data to create profile
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.id === userId) {
        return await this.createProfile(user)
      } else {
        throw new Error('Cannot create profile: user not found or unauthorized')
      }
    }
    
    return { profile: existingProfile, error }
  }
}

// Auth hook for React components
export function useAuthListener() {
  if (typeof window === 'undefined') return null
  
  const supabase = createClient()
  return supabase.auth.onAuthStateChange
}