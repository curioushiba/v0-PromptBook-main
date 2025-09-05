import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const addPromptSchema = z.object({
  prompt_id: z.string().uuid()
})

const removePromptSchema = z.object({
  prompt_id: z.string().uuid()
})

// GET: Fetch all prompts in a folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const folderId = params.id

    // Validate folder ID
    if (!z.string().uuid().safeParse(folderId).success) {
      return NextResponse.json(
        { error: 'Invalid folder ID' },
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

    // First verify the folder belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id, name')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Fetch prompts in the folder
    const { data: promptFolders, error } = await supabase
      .from('prompt_folders')
      .select(`
        prompt_id,
        created_at,
        prompts (
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
        )
      `)
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching folder prompts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch folder prompts' },
        { status: 500 }
      )
    }

    // Extract prompts from the join result
    const prompts = promptFolders?.map(pf => pf.prompts).filter(Boolean) || []

    return NextResponse.json({
      folder_id: folderId,
      folder_name: folder.name,
      prompts,
      total: prompts.length
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/folders/[id]/prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Add a prompt to a folder
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const folderId = params.id

    // Validate folder ID
    if (!z.string().uuid().safeParse(folderId).success) {
      return NextResponse.json(
        { error: 'Invalid folder ID' },
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
    const validatedData = addPromptSchema.parse(body)

    // Verify the folder belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Verify the prompt belongs to the user
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', validatedData.prompt_id)
      .eq('user_id', user.id)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    // Check if the prompt is already in the folder
    const { data: existing } = await supabase
      .from('prompt_folders')
      .select('id')
      .eq('prompt_id', validatedData.prompt_id)
      .eq('folder_id', folderId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Prompt is already in this folder' },
        { status: 400 }
      )
    }

    // Add prompt to folder
    const { data: promptFolder, error } = await supabase
      .from('prompt_folders')
      .insert({
        prompt_id: validatedData.prompt_id,
        folder_id: folderId
      })
      .select()
      .single()

    if (error) {
      console.error('Database error adding prompt to folder:', error)
      return NextResponse.json(
        { error: 'Failed to add prompt to folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Prompt added to folder successfully',
      data: promptFolder
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/folders/[id]/prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a prompt from a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const folderId = params.id

    // Validate folder ID
    if (!z.string().uuid().safeParse(folderId).success) {
      return NextResponse.json(
        { error: 'Invalid folder ID' },
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

    // Get prompt ID from query params
    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('prompt_id')

    if (!promptId || !z.string().uuid().safeParse(promptId).success) {
      return NextResponse.json(
        { error: 'Invalid prompt ID' },
        { status: 400 }
      )
    }

    // Verify the folder belongs to the user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()

    if (folderError || !folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Remove prompt from folder
    const { error } = await supabase
      .from('prompt_folders')
      .delete()
      .eq('prompt_id', promptId)
      .eq('folder_id', folderId)

    if (error) {
      console.error('Database error removing prompt from folder:', error)
      return NextResponse.json(
        { error: 'Failed to remove prompt from folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Prompt removed from folder successfully'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/folders/[id]/prompts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}