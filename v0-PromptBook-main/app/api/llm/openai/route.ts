import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { env } from "@/lib/env"
import type { LLMRequest, LLMResponse } from "@/types"

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string()
  })),
  model: z.string().optional().default("gpt-4-turbo-preview"),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().min(1).max(4000).optional().default(2000),
  stream: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // Validate environment first
    if (!env.hasOpenAI()) {
      return NextResponse.json(
        { error: "OpenAI API is not configured. Please add OPENAI_API_KEY to your environment variables." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validatedData = requestSchema.parse(body)
    
    const apiKey = env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: validatedData.model,
        messages: validatedData.messages,
        temperature: validatedData.temperature,
        max_tokens: validatedData.max_tokens,
        stream: validatedData.stream
      })
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json()
      return NextResponse.json(
        { 
          error: error.error?.message || "OpenAI API request failed",
          details: error 
        },
        { status: openAIResponse.status }
      )
    }

    if (validatedData.stream) {
      // Handle streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const reader = openAIResponse.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
                break
              }

              const chunk = decoder.decode(value)
              controller.enqueue(new TextEncoder().encode(chunk))
            }
          } catch (error) {
            controller.error(error)
          } finally {
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      })
    }

    const data = await openAIResponse.json()
    const content = data.choices[0]?.message?.content || ""
    
    return NextResponse.json({
      content,
      usage: data.usage,
      model: data.model
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("OpenAI API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}