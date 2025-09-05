import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const generateRequestSchema = z.object({
  role: z.string().min(1),
  personality: z.string().optional(),
  instruction: z.string().min(1), 
  context: z.string().optional(),
  example: z.string().optional(),
  title: z.string().optional(),
  provider: z.enum(["openai", "gemini"]).optional().default("openai")
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateRequestSchema.parse(body)
    
    // Check authentication
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Build the meta prompt from structured fields
    const metaPrompt = buildMetaPrompt(validatedData)
    
    // Generate using the specified LLM provider
    let response
    if (validatedData.provider === "gemini") {
      response = await generateWithGemini(metaPrompt)
    } else {
      response = await generateWithOpenAI(metaPrompt)
    }

    return NextResponse.json({
      metaPrompt: response.content,
      provider: validatedData.provider,
      usage: response.usage,
      model: response.model
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Prompt generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    )
  }
}

function buildMetaPrompt(data: z.infer<typeof generateRequestSchema>): string {
  const sections = []
  
  // System instruction for meta prompt generation
  sections.push(`You are an expert prompt engineer. Your task is to analyze the provided prompt components and create a well-structured, comprehensive meta-prompt that maximizes AI performance.

Please combine and enhance the following prompt components into a single, cohesive meta-prompt:`)

  // Add each provided section
  sections.push(`\n**ROLE:** ${data.role}`)
  
  if (data.personality) {
    sections.push(`\n**PERSONALITY:** ${data.personality}`)
  }
  
  sections.push(`\n**INSTRUCTIONS:** ${data.instruction}`)
  
  if (data.context) {
    sections.push(`\n**CONTEXT:** ${data.context}`)
  }
  
  if (data.example) {
    sections.push(`\n**EXAMPLE:** ${data.example}`)
  }

  sections.push(`\n\nPlease create a meta-prompt that:
1. Integrates all components seamlessly
2. Uses clear, specific language
3. Includes proper formatting for optimal AI understanding
4. Maintains the intended role and personality
5. Provides clear success criteria
6. Is ready to use without further modification

Return only the final meta-prompt without any additional commentary or explanation.`)

  return sections.join("")
}

async function generateWithOpenAI(prompt: string) {
  const openAIResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/llm/openai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineer focused on creating clear, effective prompts."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.3,
      max_tokens: 2000
    })
  })

  if (!openAIResponse.ok) {
    const error = await openAIResponse.json()
    throw new Error(error.error || "OpenAI request failed")
  }

  return await openAIResponse.json()
}

async function generateWithGemini(prompt: string) {
  const geminiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/llm/gemini`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      model: "gemini-pro",
      temperature: 0.3,
      maxOutputTokens: 2000
    })
  })

  if (!geminiResponse.ok) {
    const error = await geminiResponse.json()
    throw new Error(error.error || "Gemini request failed")
  }

  return await geminiResponse.json()
}