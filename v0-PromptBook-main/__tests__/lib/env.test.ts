import { env, validateEnv } from '@/lib/env'

describe('Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('validateEnv', () => {
    it('should validate when all required environment variables are present', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      
      expect(() => validateEnv()).not.toThrow()
    })

    it('should throw error when required environment variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      
      expect(() => validateEnv()).toThrow(/Environment validation failed/)
    })
  })

  describe('env helper methods', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
      process.env.OPENAI_API_KEY = 'test-openai-key'
      process.env.NODE_ENV = 'development'
      process.env.DEBUG = 'true'
    })

    it('should correctly identify development environment', () => {
      expect(env.isDevelopment()).toBe(true)
      expect(env.isProduction()).toBe(false)
    })

    it('should correctly identify production environment', () => {
      process.env.NODE_ENV = 'production'
      expect(env.isProduction()).toBe(true)
      expect(env.isDevelopment()).toBe(false)
    })

    it('should correctly check debug mode', () => {
      expect(env.isDebugEnabled()).toBe(true)
      
      process.env.DEBUG = 'false'
      expect(env.isDebugEnabled()).toBe(false)
    })

    it('should correctly check API availability', () => {
      expect(env.hasOpenAI()).toBe(true)
      expect(env.hasGemini()).toBe(false)
      
      process.env.GEMINI_API_KEY = 'test-gemini-key'
      expect(env.hasGemini()).toBe(true)
    })

    it('should return app URL with fallback', () => {
      expect(env.getAppUrl()).toBe('http://localhost:3000')
      
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com'
      expect(env.getAppUrl()).toBe('https://myapp.com')
    })
  })

  describe('env.get', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    })

    it('should return specific environment variable value', () => {
      expect(env.get('NEXT_PUBLIC_SUPABASE_URL')).toBe('https://test.supabase.co')
      expect(env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')).toBe('test-key')
    })

    it('should return undefined for optional missing variables', () => {
      expect(env.get('OPENAI_API_KEY')).toBeUndefined()
      expect(env.get('GEMINI_API_KEY')).toBeUndefined()
    })
  })
})