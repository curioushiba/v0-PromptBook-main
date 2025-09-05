import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Required environment variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  
  // Optional but recommended
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  DEBUG: z.string().optional().default('false'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentConfig {
  private config: EnvConfig | null = null;
  private validated = false;

  /**
   * Validates environment variables on first access
   * Throws error if required variables are missing
   */
  public validate(): EnvConfig {
    if (this.validated && this.config) {
      return this.config;
    }

    try {
      // Parse and validate environment variables
      this.config = envSchema.parse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: process.env.NODE_ENV,
        DEBUG: process.env.DEBUG,
      });

      // Additional validation: at least one LLM key should be present
      if (!this.config.OPENAI_API_KEY && !this.config.GEMINI_API_KEY) {
        console.warn('⚠️ Warning: No LLM API keys configured. AI features will not work.');
      }

      this.validated = true;
      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
        throw new Error(
          `❌ Environment validation failed!\n` +
          `Missing or invalid variables: ${missingVars}\n` +
          `Please check your .env.local file and ensure all required variables are set.\n` +
          `Refer to .env.local.example for the correct format.`
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific environment variable with type safety
   */
  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    const config = this.validate();
    return config[key];
  }

  /**
   * Get all validated environment variables
   */
  public getAll(): EnvConfig {
    return this.validate();
  }

  /**
   * Check if running in development mode
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugEnabled(): boolean {
    return this.get('DEBUG') === 'true';
  }

  /**
   * Get the base URL for the application
   */
  public getAppUrl(): string {
    return this.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';
  }

  /**
   * Check if OpenAI is configured
   */
  public hasOpenAI(): boolean {
    return !!this.get('OPENAI_API_KEY');
  }

  /**
   * Check if Gemini is configured
   */
  public hasGemini(): boolean {
    return !!this.get('GEMINI_API_KEY');
  }
}

// Export singleton instance
export const env = new EnvironmentConfig();

// Export helper for immediate validation (useful for app initialization)
export function validateEnv(): void {
  env.validate();
}