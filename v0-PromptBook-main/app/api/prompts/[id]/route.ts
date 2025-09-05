import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for updating a prompt
const updatePromptSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  role_field: z.string().optional(),
  personality_field: z.string().optional(),
  instruction_field: z.string().optional(),
  context_field: z.string().optional(),
  example_field: z.string().optional(),
  meta_prompt: z.string().optional()
})

// GET: Fetch a single prompt by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const promptId = params.id

    // Validate prompt ID
    if (!z.string().uuid().safeParse(promptId).success) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      )
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the prompt
    const { data: prompt, error } = await supabase
      .from('prompts')
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
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single()

    if (error || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prompt })

  } catch (error) {
    console.error('Unexpected error in GET /api/prompts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update a prompt
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const promptId = params.id

    // Validate prompt ID
    if (!z.string().uuid().safeParse(promptId).success) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      )
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updatePromptSchema.parse(body)

    // Check if there's anything to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update the prompt
    const { data: updatedPrompt, error } = await supabase
      .from('prompts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .eq('user_id', user.id) // Ensure user owns the prompt
      .select()
      .single()

    if (error) {
      console.error('Database error updating prompt:', error)
      return NextResponse.json(
        { error: 'Failed to update prompt' },
        { status: 500 }
      )
    }

    if (!updatedPrompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Increment usage count if meta_prompt was regenerated
    if (validatedData.meta_prompt) {
      await supabase
        .from('prompts')
        .update({ usage_count: updatedPrompt.usage_count + 1 })
        .eq('id', promptId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      message: 'Prompt updated successfully',
      prompt: updatedPrompt
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error in PATCH /api/prompts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const promptId = params.id

    // Validate prompt ID
    if (!z.string().uuid().safeParse(promptId).success) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      )
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the prompt (cascade will handle prompt_folders)
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', user.id) // Ensure user owns the prompt

    if (error) {
      console.error('Database error deleting prompt:', error)
      return NextResponse.json(
        { error: 'Failed to delete prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Prompt deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/prompts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}