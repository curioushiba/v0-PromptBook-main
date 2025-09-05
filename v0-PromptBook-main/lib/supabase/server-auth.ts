import { createClient as createServerClient } from './server'

// Server-side authentication utilities
export const serverAuth = {
  // Get current user (server-side)
  async getUser() {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  // Get current session (server-side)
  async getSession() {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  }
}