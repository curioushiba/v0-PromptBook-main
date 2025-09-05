import { PromptFormData } from "@/lib/validations/prompt"

export type LLMProvider = "openai" | "gemini"

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface GenerateMetaPromptOptions {
  streaming?: boolean
  signal?: AbortSignal
}

class LLMService {
  private config: LLMConfig | null = null

  configure(config: LLMConfig) {
    this.config = config
  }

  private buildSystemPrompt(): string {
    return `You are an expert prompt engineer specializing in creating highly effective prompts for AI models. 
Your task is to take structured prompt components and synthesize them into a comprehensive, well-formatted meta prompt that will produce optimal results.

Guidelines:
1. Maintain clarity and specificity
2. Use proper formatting and structure
3. Incorporate all provided components seamlessly
4. Optimize for the target AI model's understanding
5. Ensure the prompt is actionable and unambiguous
6. Add relevant context and constraints where appropriate
7. Use examples effectively to guide behavior

Output only the enhanced meta prompt without any additional explanation or metadata.`
  }

  private buildUserPrompt(data: PromptFormData): string {
    const components = []

    components.push(`ROLE: ${data.role}`)
    
    if (data.personality) {
      components.push(`PERSONALITY: ${data.personality}`)
    }
    
    components.push(`INSTRUCTIONS: ${data.instruction}`)
    
    if (data.context) {
      components.push(`CONTEXT: ${data.context}`)
    }
    
    if (data.example) {
      components.push(`EXAMPLES: ${data.example}`)
    }

    return `Create a comprehensive meta prompt from these components:

${components.join("\n\n")}

Synthesize these into a single, cohesive prompt that maximizes effectiveness.`
  }

  async generateMetaPrompt(
    data: PromptFormData,
    options: GenerateMetaPromptOptions = {}
  ): Promise<string> {
    if (!this.config) {
      // Use default configuration from environment
      // Note: We can't access server-side env vars from client, 
      // so we rely on the API routes to handle authentication
      const provider = (typeof window !== 'undefined' 
        ? window.localStorage.getItem('llm_provider') 
        : null) as LLMProvider || "openai"

      this.config = {
        provider,
        apiKey: "", // API key is handled server-side
        model: provider === "openai" ? "gpt-3.5-turbo" : "gemini-pro",
        temperature: 0.7,
        maxTokens: 2000
      }
    }

    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(data)

    if (this.config.provider === "openai") {
      return this.generateWithOpenAI(systemPrompt, userPrompt, options)
    } else if (this.config.provider === "gemini") {
      return this.generateWithGemini(systemPrompt, userPrompt, options)
    } else {
      throw new Error(`Unsupported LLM provider: ${this.config.provider}`)
    }
  }

  private async generateWithOpenAI(
    systemPrompt: string,
    userPrompt: string,
    options: GenerateMetaPromptOptions
  ): Promise<string> {
    const response = await fetch("/api/llm/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: this.config?.model || "gpt-3.5-turbo",
        temperature: this.config?.temperature || 0.7,
        max_tokens: this.config?.maxTokens || 2000,
        stream: options.streaming || false
      }),
      signal: options.signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
      console.error("OpenAI API error:", errorData)
      throw new Error(errorData.error || errorData.message || "Failed to generate with OpenAI")
    }

    if (options.streaming) {
      // Handle streaming response
      return this.handleStreamingResponse(response)
    }

    const result = await response.json()
    return result.content
  }

  private async generateWithGemini(
    systemPrompt: string,
    userPrompt: string,
    options: GenerateMetaPromptOptions
  ): Promise<string> {
    const response = await fetch("/api/llm/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        model: this.config?.model || "gemini-pro",
        temperature: this.config?.temperature || 0.7,
        maxOutputTokens: this.config?.maxTokens || 2000,
        stream: options.streaming || false
      }),
      signal: options.signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
      console.error("Gemini API error:", errorData)
      throw new Error(errorData.error || errorData.message || "Failed to generate with Gemini")
    }

    if (options.streaming) {
      // Handle streaming response
      return this.handleStreamingResponse(response)
    }

    const result = await response.json()
    return result.content
  }

  private async handleStreamingResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let fullContent = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") continue
          
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
            }
          } catch (e) {
            console.error("Failed to parse streaming chunk:", e)
          }
        }
      }
    }

    return fullContent
  }

  // Utility function to estimate cost
  estimateCost(tokenCount: number, provider: LLMProvider = "openai"): number {
    const rates = {
      openai: {
        input: 0.01 / 1000,  // $0.01 per 1K tokens
        output: 0.03 / 1000  // $0.03 per 1K tokens
      },
      gemini: {
        input: 0.00025 / 1000,  // $0.00025 per 1K tokens
        output: 0.0005 / 1000   // $0.0005 per 1K tokens
      }
    }

    const rate = rates[provider]
    // Rough estimate assuming output is 2x input
    return (tokenCount * rate.input) + (tokenCount * 2 * rate.output)
  }
}

// Export singleton instance
export const llmService = new LLMService()

// Export utility functions
export async function generateMetaPrompt(
  data: PromptFormData,
  options?: GenerateMetaPromptOptions
): Promise<string> {
  return llmService.generateMetaPrompt(data, options)
}

export function estimateLLMCost(
  tokenCount: number,
  provider: LLMProvider = "openai"
): number {
  return llmService.estimateCost(tokenCount, provider)
}