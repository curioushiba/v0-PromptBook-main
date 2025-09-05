import { PromptFormData } from "@/lib/validations/prompt"
import { ACTIVE_SYSTEM_PROMPT } from "@/lib/llm/system-prompts"

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
    // Use the Meta-Prompt Generation Framework v1.0
    const prompt = ACTIVE_SYSTEM_PROMPT
    console.log("System prompt loaded, length:", prompt?.length || 0)
    if (!prompt) {
      console.error("WARNING: System prompt is empty!")
    }
    return prompt
  }

  private buildUserPrompt(data: PromptFormData): string {
    // Format the user input according to the Meta-Prompt Framework's expectations
    const components = []

    // Always include Role and Instruction as they are required
    components.push(`Role: ${data.role}`)
    
    // Include optional fields only if provided
    components.push(`Personality: ${data.personality || "Not specified - use professional and clear communication style"}`)
    
    components.push(`Instruction: ${data.instruction}`)
    
    components.push(`Context: ${data.context || "General purpose - no specific domain constraints"}`)
    
    components.push(`Examples: ${data.example || "No examples provided - generate appropriate demonstrations based on the role and instructions"}`)

    // Format according to the framework's input processing protocol
    return `Based on the following user inputs, generate a comprehensive meta-prompt that will optimize LLM performance:

${components.join("\n\n")}

IMPORTANT: Apply the full Meta-Prompt Generation Framework methodology to transform these basic inputs into a sophisticated, production-ready prompt. The output should be a complete, enhanced meta-prompt that incorporates best practices in prompt engineering, including clear structure, context setting, and optimization techniques.`
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
        : null) as LLMProvider || "gemini"  // Try Gemini first since you have that API key

      this.config = {
        provider,
        apiKey: "", // API key is handled server-side
        model: provider === "openai" ? "gpt-3.5-turbo" : "gemini-1.5-flash",
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
    console.log("generateWithGemini called")
    console.log("System prompt length:", systemPrompt.length)
    console.log("User prompt preview:", userPrompt.substring(0, 200))
    
    const response = await fetch("/api/llm/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        model: this.config?.model || "gemini-1.5-flash",
        temperature: this.config?.temperature || 0.7,
        maxOutputTokens: this.config?.maxTokens || 2000,
        stream: options.streaming || false
      }),
      signal: options.signal
    })

    console.log("Gemini API response status:", response.status)

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
    console.log("Gemini API result:", result)
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