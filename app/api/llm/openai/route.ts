import { NextRequest, NextResponse } from "next/server"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY
    
    // Debug logging
    console.log("OpenAI API Route - Key exists:", !!apiKey)
    console.log("OpenAI API Route - Key prefix:", apiKey?.substring(0, 10) + "...")
    
    if (!apiKey) {
      console.error("OpenAI API key not found in environment variables")
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      messages,
      model = "gpt-3.5-turbo",
      temperature = 0.7,
      max_tokens = 2000,
      stream = false
    } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      )
    }

    // Make request to OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream
      })
    })

    // Check for API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API error:", errorData)
      
      // Handle common error cases
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        )
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      }
      
      if (response.status === 400) {
        return NextResponse.json(
          { error: errorData.error?.message || "Invalid request to OpenAI" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to generate prompt" },
        { status: response.status }
      )
    }

    // Handle streaming response
    if (stream) {
      // For streaming, we pass through the response directly
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      })
    }

    // Handle non-streaming response
    const data = await response.json()
    const content = data.choices[0]?.message?.content || ""
    
    return NextResponse.json({
      content,
      usage: data.usage,
      model: data.model
    })
    
  } catch (error) {
    console.error("OpenAI route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}