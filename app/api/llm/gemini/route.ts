import { NextRequest, NextResponse } from "next/server"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

export async function POST(request: NextRequest) {
  try {
    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      prompt,
      model = "gemini-pro",
      temperature = 0.7,
      maxOutputTokens = 2000,
      stream = false
    } = body

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Construct API URL with model and method
    const apiUrl = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`

    // Prepare request body for Gemini
    const geminiRequestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        topK: 40,
        topP: 0.95
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }

    // Make request to Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(geminiRequestBody)
    })

    // Check for API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Gemini API error:", errorData)
      
      // Handle common error cases
      if (response.status === 401 || response.status === 403) {
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
          { error: errorData.error?.message || "Invalid request to Gemini" },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to generate prompt" },
        { status: response.status }
      )
    }

    // Parse the response
    const data = await response.json()
    
    // Extract content from Gemini response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Check for safety blocks
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Content was blocked by safety filters. Please modify your input and try again." },
        { status: 400 }
      )
    }
    
    // Check if no content was generated
    if (!content) {
      return NextResponse.json(
        { error: "No content was generated. Please try again." },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      content,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount,
        completion_tokens: data.usageMetadata?.candidatesTokenCount,
        total_tokens: data.usageMetadata?.totalTokenCount
      },
      model
    })
    
  } catch (error) {
    console.error("Gemini route error:", error)
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