import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { Prompt, CreatePromptRequest, UpdatePromptRequest, PromptQueryParams } from "@/types"

// Schema for creating a new prompt
const createPromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  role: z.string().min(1, "Role is required"),
  personality: z.string().optional(),
  instruction: z.string().min(1, "Instruction is required"), 
  context: z.string().optional(),
  example: z.string().optional(),
  metaPrompt: z.string().min(1, "Meta prompt is required"),
})

// Schema for updating a prompt
const updatePromptSchema = createPromptSchema.partial().extend({
  id: z.string().uuid(),
})

// Schema for query parameters
const querySchema = z.object({
  search: z.string().optional(),
  folderId: z.string().optional(),
  isFavorite: z.boolean().optional(),
  orderBy: z.enum(["created_at", "updated_at", "title", "usage_count"]).optional().default("created_at"),
  orderDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = {
      search: searchParams.get("search") || undefined,
      folderId: searchParams.get("folderId") || undefined,
      isFavorite: searchParams.get("isFavorite") === "true" || undefined,
      orderBy: searchParams.get("orderBy") || "created_at",
      orderDirection: searchParams.get("orderDirection") || "desc",
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0")
    }

    const validatedParams = querySchema.parse(params)

    // Build query
    let query = supabase
      .from("prompts")
      .select(`
        id,
        title,
        role_field,
        personality_field, 
        instruction_field,
        context_field,
        example_field,
        meta_prompt,
        is_favorite,
        usage_count,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)

    // Apply filters
    if (validatedParams.search) {
      query = query.or(`title.ilike.%${validatedParams.search}%,meta_prompt.ilike.%${validatedParams.search}%`)
    }

    if (validatedParams.isFavorite !== undefined) {
      query = query.eq("is_favorite", validatedParams.isFavorite)
    }

    if (validatedParams.folderId) {
      query = query.eq("folder_id", validatedParams.folderId)
    }

    // Apply ordering and pagination
    query = query
      .order(validatedParams.orderBy, { ascending: validatedParams.orderDirection === "asc" })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1)

    const { data: prompts, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 })
    }

    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPromptSchema.parse(body)

    const { data: prompt, error } = await supabase
      .from("prompts")
      .insert({
        user_id: user.id,
        title: validatedData.title,
        role_field: validatedData.role,
        personality_field: validatedData.personality || null,
        instruction_field: validatedData.instruction,
        context_field: validatedData.context || null,
        example_field: validatedData.example || null,
        meta_prompt: validatedData.metaPrompt,
        is_favorite: false,
        usage_count: 0
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
    }

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePromptSchema.parse(body)
    
    const { id, ...updateData } = validatedData

    // Convert field names to database columns
    const dbData: Partial<{
      title: string;
      role_field: string;
      personality_field: string;
      instruction_field: string;
      context_field: string;
      example_field: string;
      meta_prompt: string;
    }> = {}
    if (updateData.title !== undefined) dbData.title = updateData.title
    if (updateData.role !== undefined) dbData.role_field = updateData.role
    if (updateData.personality !== undefined) dbData.personality_field = updateData.personality
    if (updateData.instruction !== undefined) dbData.instruction_field = updateData.instruction
    if (updateData.context !== undefined) dbData.context_field = updateData.context
    if (updateData.example !== undefined) dbData.example_field = updateData.example
    if (updateData.metaPrompt !== undefined) dbData.meta_prompt = updateData.metaPrompt

    const { data: prompt, error } = await supabase
      .from("prompts")
      .update(dbData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 })
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 })
    }

    const { data: prompt, error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
    }

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Prompt deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}