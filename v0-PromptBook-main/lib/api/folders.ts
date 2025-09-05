import { createClient } from "@/lib/supabase/client"
import { 
  Folder, 
  FolderInsert, 
  FolderUpdate,
  FolderWithPromptCount 
} from "@/lib/supabase/types"
import { FolderFormData } from "@/lib/validations/prompt"

export interface FolderFilters {
  search?: string
  orderBy?: "name" | "created_at" | "updated_at"
  orderDirection?: "asc" | "desc"
  limit?: number
  offset?: number
}

class FoldersAPI {
  private supabase = createClient()

  // Create a new folder
  async create(data: FolderFormData): Promise<Folder> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const folderData: FolderInsert = {
      user_id: user.user.id,
      name: data.name,
      description: data.description || null,
      color: data.color || "blue",
    }

    const { data: folder, error } = await this.supabase
      .from("folders")
      .insert(folderData)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        throw new Error("A folder with this name already exists")
      }
      throw error
    }
    
    return folder
  }

  // Get all folders with prompt counts
  async getAll(filters: FolderFilters = {}): Promise<FolderWithPromptCount[]> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    let query = this.supabase
      .from("folders")
      .select(`
        *,
        prompt_folders (
          prompt_id
        )
      `)
      .eq("user_id", user.user.id)

    // Apply search filter
    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`)
    }

    // Apply ordering
    const orderBy = filters.orderBy || "name"
    const orderDirection = filters.orderDirection || "asc"
    query = query.order(orderBy, { ascending: orderDirection === "asc" })

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data to include prompt count
    const folders: FolderWithPromptCount[] = data?.map(folder => ({
      ...folder,
      prompt_count: folder.prompt_folders?.length || 0
    })) || []

    return folders
  }

  // Get a single folder by ID with prompts
  async getById(id: string): Promise<FolderWithPromptCount> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("folders")
      .select(`
        *,
        prompt_folders (
          prompts (*)
        )
      `)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single()

    if (error) throw error
    if (!data) throw new Error("Folder not found")

    return {
      ...data,
      prompt_count: data.prompt_folders?.length || 0,
      prompts: data.prompt_folders?.map((pf: any) => pf.prompts).filter(Boolean) || []
    }
  }

  // Update a folder
  async update(id: string, updates: Partial<FolderUpdate>): Promise<Folder> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("folders")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        throw new Error("A folder with this name already exists")
      }
      throw error
    }
    
    return data
  }

  // Delete a folder
  async delete(id: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    // Note: Related prompt_folders entries will be automatically deleted due to CASCADE
    const { error } = await this.supabase
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id)

    if (error) throw error
  }

  // Get folders for a specific prompt
  async getByPromptId(promptId: string): Promise<Folder[]> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("prompt_folders")
      .select(`
        folders (*)
      `)
      .eq("prompt_id", promptId)

    if (error) throw error

    return data?.map((pf: any) => pf.folders).filter(Boolean) || []
  }

  // Get prompts in a folder
  async getPrompts(folderId: string) {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("prompt_folders")
      .select(`
        prompts (*)
      `)
      .eq("folder_id", folderId)

    if (error) throw error

    return data?.map((pf: any) => pf.prompts).filter(Boolean) || []
  }

  // Add prompt to folder
  async addPrompt(folderId: string, promptId: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    // Check if the assignment already exists
    const { data: existing } = await this.supabase
      .from("prompt_folders")
      .select("id")
      .eq("folder_id", folderId)
      .eq("prompt_id", promptId)
      .single()

    if (existing) {
      return // Already assigned
    }

    const { error } = await this.supabase
      .from("prompt_folders")
      .insert({
        folder_id: folderId,
        prompt_id: promptId
      })

    if (error) throw error
  }

  // Remove prompt from folder
  async removePrompt(folderId: string, promptId: string): Promise<void> {
    const { error } = await this.supabase
      .from("prompt_folders")
      .delete()
      .eq("folder_id", folderId)
      .eq("prompt_id", promptId)

    if (error) throw error
  }

  // Get folder statistics
  async getStats(): Promise<{
    totalFolders: number
    totalPromptAssignments: number
    averagePromptsPerFolder: number
  }> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const folders = await this.getAll()
    const totalFolders = folders.length
    const totalPromptAssignments = folders.reduce((acc, folder) => 
      acc + (folder.prompt_count || 0), 0
    )
    const averagePromptsPerFolder = totalFolders > 0 
      ? totalPromptAssignments / totalFolders 
      : 0

    return {
      totalFolders,
      totalPromptAssignments,
      averagePromptsPerFolder
    }
  }

  // Duplicate a folder (with or without prompts)
  async duplicate(id: string, includePrompts: boolean = false): Promise<Folder> {
    const folder = await this.getById(id)
    
    const newFolder = await this.create({
      name: `${folder.name} (Copy)`,
      description: folder.description || undefined,
      color: folder.color as any
    })

    if (includePrompts && folder.prompts && folder.prompts.length > 0) {
      for (const prompt of folder.prompts) {
        await this.addPrompt(newFolder.id, prompt.id)
      }
    }

    return newFolder
  }
}

// Export singleton instance
export const foldersAPI = new FoldersAPI()

// Export convenience functions
export const folders = {
  create: (data: FolderFormData) => foldersAPI.create(data),
  getAll: (filters?: FolderFilters) => foldersAPI.getAll(filters),
  getById: (id: string) => foldersAPI.getById(id),
  update: (id: string, updates: Partial<FolderUpdate>) => foldersAPI.update(id, updates),
  delete: (id: string) => foldersAPI.delete(id),
  getByPromptId: (promptId: string) => foldersAPI.getByPromptId(promptId),
  getPrompts: (folderId: string) => foldersAPI.getPrompts(folderId),
  addPrompt: (folderId: string, promptId: string) => foldersAPI.addPrompt(folderId, promptId),
  removePrompt: (folderId: string, promptId: string) => foldersAPI.removePrompt(folderId, promptId),
  getStats: () => foldersAPI.getStats(),
  duplicate: (id: string, includePrompts?: boolean) => foldersAPI.duplicate(id, includePrompts)
}