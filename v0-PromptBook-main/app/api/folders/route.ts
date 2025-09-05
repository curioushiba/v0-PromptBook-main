import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createFolderSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  color: z.string().optional().default('from-blue-500 to-blue-600')
})

const updateFolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional().nullable(),
  color: z.string().optional()
})

// GET: Fetch all folders for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's folders with prompt count
    const { data: folders, error } = await supabase
      .from('folders')
      .select(`
        id,
        name,
        description,
        color,
        created_at,
        updated_at,
        prompt_folders (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error fetching folders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      )
    }

    // Transform the data to include prompt count
    const foldersWithCount = folders?.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      prompt_count: folder.prompt_folders?.[0]?.count || 0
    })) || []

    return NextResponse.json({
      folders: foldersWithCount,
      total: foldersWithCount.length
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new folder
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
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
    const validatedData = createFolderSchema.parse(body)

    // Create the folder
    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating folder:', error)
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A folder with this name already exists' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Folder created successfully',
      folder
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update an existing folder
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    
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
    const validatedData = updateFolderSchema.parse(body)

    // Prepare update object
    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.color !== undefined) updateData.color = validatedData.color

    // Update the folder
    const { data: folder, error } = await supabase
      .from('folders')
      .update(updateData)
      .eq('id', validatedData.id)
      .eq('user_id', user.id) // Ensure user owns the folder
      .select()
      .single()

    if (error) {
      console.error('Database error updating folder:', error)
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Folder updated successfully',
      folder
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Unexpected error in PATCH /api/folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a folder
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get folder ID from query params
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('id')

    if (!folderId || !z.string().uuid().safeParse(folderId).success) {
      return NextResponse.json(
        { error: 'Invalid folder ID' },
        { status: 400 }
      )
    }

    // Delete the folder (cascade will handle prompt_folders)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id) // Ensure user owns the folder

    if (error) {
      console.error('Database error deleting folder:', error)
      return NextResponse.json(
        { error: 'Failed to delete folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Folder deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/folders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}