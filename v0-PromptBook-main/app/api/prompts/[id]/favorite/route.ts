import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const promptId = params.id

    // Get the current favorite status
    const { data: currentPrompt, error: fetchError } = await supabase
      .from("prompts")
      .select("is_favorite")
      .eq("id", promptId)
      .eq("user_id", user.id)
      .single()

    if (fetchError) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    // Toggle the favorite status
    const newFavoriteStatus = !currentPrompt.is_favorite

    const { data: updatedPrompt, error: updateError } = await supabase
      .from("prompts")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", promptId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 })
    }

    return NextResponse.json({ 
      prompt: updatedPrompt,
      isFavorite: newFavoriteStatus
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}