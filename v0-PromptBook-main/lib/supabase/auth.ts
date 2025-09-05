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
    
    return { data, error }
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    return { data, error }
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
  }
}

// Auth hook for React components
export function useAuthListener() {
  if (typeof window === 'undefined') return null
  
  const supabase = createClient()
  return supabase.auth.onAuthStateChange
}