import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Check which API keys are available
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  
  const status = {
    openai: {
      configured: !!openaiKey,
      keyPrefix: openaiKey ? openaiKey.substring(0, 10) + "..." : "NOT_FOUND",
      keyLength: openaiKey?.length || 0
    },
    gemini: {
      configured: !!geminiKey,
      keyPrefix: geminiKey ? geminiKey.substring(0, 10) + "..." : "NOT_FOUND",
      keyLength: geminiKey?.length || 0
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasEnvLocal: !!process.env.NEXT_PUBLIC_SUPABASE_URL, // Check if .env.local is loaded
    }
  }
  
  console.log("API Key Test Status:", status)
  
  return NextResponse.json(status)
}

// Test actual API connection
export async function POST(request: NextRequest) {
  try {
    const { provider = "gemini", testMessage = "Hello, this is a test" } = await request.json()
    
    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
      }
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a test assistant. Reply with 'TEST_SUCCESS' to confirm connection." },
            { role: "user", content: testMessage }
          ],
          max_tokens: 50,
          temperature: 0
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json({ 
          provider: "openai",
          success: false,
          error: error.error?.message || "API call failed",
          status: response.status
        }, { status: response.status })
      }
      
      const data = await response.json()
      return NextResponse.json({
        provider: "openai",
        success: true,
        response: data.choices[0]?.message?.content || "No response"
      })
      
    } else if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
      }
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Reply with 'TEST_SUCCESS' to confirm connection. User message: " + testMessage
            }]
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 50
          }
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json({ 
          provider: "gemini",
          success: false,
          error: error.error?.message || "API call failed",
          status: response.status
        }, { status: response.status })
      }
      
      const data = await response.json()
      return NextResponse.json({
        provider: "gemini",
        success: true,
        response: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
      })
    }
    
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    
  } catch (error) {
    console.error("Test endpoint error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Test failed",
      details: error
    }, { status: 500 })
  }
}