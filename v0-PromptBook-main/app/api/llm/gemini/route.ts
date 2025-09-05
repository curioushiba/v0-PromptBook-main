import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"

const requestSchema = z.object({
  prompt: z.string(),
  model: z.string().optional().default("gemini-pro"),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxOutputTokens: z.number().min(1).max(4000).optional().default(2000),
  stream: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // Validate environment first
    if (!env.hasGemini()) {
      return NextResponse.json(
        { error: "Gemini API is not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validatedData = requestSchema.parse(body)
    
    const apiKey = env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${validatedData.model}:generateContent?key=${apiKey}`
    
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: validatedData.prompt
          }]
        }],
        generationConfig: {
          temperature: validatedData.temperature,
          maxOutputTokens: validatedData.maxOutputTokens,
        }
      })
    })

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json()
      return NextResponse.json(
        { 
          error: error.error?.message || "Gemini API request failed",
          details: error 
        },
        { status: geminiResponse.status }
      )
    }

    const data = await geminiResponse.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    return NextResponse.json({
      content,
      usage: {
        prompt_tokens: data.promptFeedback?.tokenCount || 0,
        completion_tokens: data.candidates?.[0]?.tokenCount || 0,
        total_tokens: (data.promptFeedback?.tokenCount || 0) + (data.candidates?.[0]?.tokenCount || 0)
      },
      model: validatedData.model
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}