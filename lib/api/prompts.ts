import { createClient } from "@/lib/supabase/client"
import { 
  Prompt, 
  PromptInsert, 
  PromptUpdate,
  PromptWithFolders 
} from "@/lib/supabase/types"
import { PromptFormData } from "@/lib/validations/prompt"

export interface PromptFilters {
  search?: string
  folderId?: string
  isFavorite?: boolean
  orderBy?: "created_at" | "updated_at" | "title" | "usage_count"
  orderDirection?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface PromptStats {
  totalPrompts: number
  favoritePrompts: number
  totalFolders: number
  mostUsedPrompt?: Prompt
}

class PromptsAPI {
  private supabase = createClient()

  // Create a new prompt
  async create(data: PromptFormData & { metaPrompt: string }): Promise<Prompt> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const promptData: PromptInsert = {
      user_id: user.user.id,
      title: data.title,
      role_field: data.role,
      personality_field: data.personality || null,
      instruction_field: data.instruction,
      context_field: data.context || null,
      example_field: data.example || null,
      meta_prompt: data.metaPrompt,
      is_favorite: false,
      usage_count: 0,
    }

    const { data: prompt, error } = await this.supabase
      .from("prompts")
      .insert(promptData)
      .select()
      .single()

    if (error) throw error
    return prompt
  }

  // Get all prompts with filters
  async getAll(filters: PromptFilters = {}): Promise<{ 
    prompts: PromptWithFolders[]
    count: number 
  }> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    let query = this.supabase
      .from("prompts")
      .select(`
        *,
        prompt_folders (
          folder_id,
          folders (*)
        )
      `, { count: "exact" })
      .eq("user_id", user.user.id)

    // Apply search filter
    if (filters.search) {
      query = query.textSearch("search_vector", filters.search, {
        type: "websearch"
      })
    }

    // Apply favorite filter
    if (filters.isFavorite !== undefined) {
      query = query.eq("is_favorite", filters.isFavorite)
    }

    // Apply folder filter
    if (filters.folderId) {
      const { data: promptIds } = await this.supabase
        .from("prompt_folders")
        .select("prompt_id")
        .eq("folder_id", filters.folderId)
      
      if (promptIds && promptIds.length > 0) {
        query = query.in("id", promptIds.map(p => p.prompt_id))
      } else {
        // If no prompts in folder, return empty result
        query = query.eq("id", "non-existent-id")
      }
    }

    // Apply ordering
    const orderBy = filters.orderBy || "created_at"
    const orderDirection = filters.orderDirection || "desc"
    query = query.order(orderBy, { ascending: orderDirection === "asc" })

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Transform the data to include folders directly
    const prompts: PromptWithFolders[] = data?.map(prompt => ({
      ...prompt,
      folders: prompt.prompt_folders?.map((pf: any) => pf.folders).filter(Boolean) || []
    })) || []

    return { prompts, count: count || 0 }
  }

  // Get a single prompt by ID
  async getById(id: string): Promise<PromptWithFolders> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("prompts")
      .select(`
        *,
        prompt_folders (
          folder_id,
          folders (*)
        )
      `)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .single()

    if (error) throw error
    if (!data) throw new Error("Prompt not found")

    return {
      ...data,
      folders: data.prompt_folders?.map((pf: any) => pf.folders).filter(Boolean) || []
    }
  }

  // Update a prompt
  async update(id: string, updates: Partial<PromptUpdate>): Promise<Prompt> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("prompts")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete a prompt
  async delete(id: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { error } = await this.supabase
      .from("prompts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.user.id)

    if (error) throw error
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<Prompt> {
    const prompt = await this.getById(id)
    return this.update(id, { is_favorite: !prompt.is_favorite })
  }

  // Increment usage count
  async incrementUsage(id: string): Promise<Prompt> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const { data, error } = await this.supabase
      .from("prompts")
      .update({ 
        usage_count: this.supabase.raw("usage_count + 1"),
        last_used_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", user.user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Duplicate a prompt
  async duplicate(id: string): Promise<Prompt> {
    const originalPrompt = await this.getById(id)
    
    return this.create({
      title: `${originalPrompt.title} (Copy)`,
      role: originalPrompt.role_field,
      personality: originalPrompt.personality_field || undefined,
      instruction: originalPrompt.instruction_field,
      context: originalPrompt.context_field || undefined,
      example: originalPrompt.example_field || undefined,
      metaPrompt: originalPrompt.meta_prompt || ""
    })
  }

  // Get recent prompts
  async getRecent(limit: number = 10): Promise<Prompt[]> {
    const { prompts } = await this.getAll({
      orderBy: "created_at",
      orderDirection: "desc",
      limit
    })
    return prompts
  }

  // Get favorite prompts
  async getFavorites(limit?: number): Promise<Prompt[]> {
    const { prompts } = await this.getAll({
      isFavorite: true,
      orderBy: "updated_at",
      orderDirection: "desc",
      limit
    })
    return prompts
  }

  // Get most used prompts
  async getMostUsed(limit: number = 5): Promise<Prompt[]> {
    const { prompts } = await this.getAll({
      orderBy: "usage_count",
      orderDirection: "desc",
      limit
    })
    return prompts
  }

  // Get prompt statistics
  async getStats(): Promise<PromptStats> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    // Get total prompts count
    const { count: totalPrompts } = await this.supabase
      .from("prompts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id)

    // Get favorite prompts count
    const { count: favoritePrompts } = await this.supabase
      .from("prompts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id)
      .eq("is_favorite", true)

    // Get total folders count
    const { count: totalFolders } = await this.supabase
      .from("folders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user.id)

    // Get most used prompt
    const { data: mostUsedPrompt } = await this.supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.user.id)
      .order("usage_count", { ascending: false })
      .limit(1)
      .single()

    return {
      totalPrompts: totalPrompts || 0,
      favoritePrompts: favoritePrompts || 0,
      totalFolders: totalFolders || 0,
      mostUsedPrompt: mostUsedPrompt || undefined
    }
  }

  // Search prompts
  async search(query: string): Promise<Prompt[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    const { prompts } = await this.getAll({
      search: query,
      limit: 20
    })
    
    return prompts
  }

  // Assign prompt to folders
  async assignToFolders(promptId: string, folderIds: string[]): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    // First, remove existing folder assignments
    await this.supabase
      .from("prompt_folders")
      .delete()
      .eq("prompt_id", promptId)

    // Then add new folder assignments
    if (folderIds.length > 0) {
      const assignments = folderIds.map(folderId => ({
        prompt_id: promptId,
        folder_id: folderId
      }))

      const { error } = await this.supabase
        .from("prompt_folders")
        .insert(assignments)

      if (error) throw error
    }
  }

  // Remove prompt from folder
  async removeFromFolder(promptId: string, folderId: string): Promise<void> {
    const { error } = await this.supabase
      .from("prompt_folders")
      .delete()
      .eq("prompt_id", promptId)
      .eq("folder_id", folderId)

    if (error) throw error
  }
}

// Export singleton instance
export const promptsAPI = new PromptsAPI()

// Export convenience functions
export const prompts = {
  create: (data: PromptFormData & { metaPrompt: string }) => promptsAPI.create(data),
  getAll: (filters?: PromptFilters) => promptsAPI.getAll(filters),
  getById: (id: string) => promptsAPI.getById(id),
  update: (id: string, updates: Partial<PromptUpdate>) => promptsAPI.update(id, updates),
  delete: (id: string) => promptsAPI.delete(id),
  toggleFavorite: (id: string) => promptsAPI.toggleFavorite(id),
  incrementUsage: (id: string) => promptsAPI.incrementUsage(id),
  duplicate: (id: string) => promptsAPI.duplicate(id),
  getRecent: (limit?: number) => promptsAPI.getRecent(limit),
  getFavorites: (limit?: number) => promptsAPI.getFavorites(limit),
  getMostUsed: (limit?: number) => promptsAPI.getMostUsed(limit),
  getStats: () => promptsAPI.getStats(),
  search: (query: string) => promptsAPI.search(query),
  assignToFolders: (promptId: string, folderIds: string[]) => promptsAPI.assignToFolders(promptId, folderIds),
  removeFromFolder: (promptId: string, folderId: string) => promptsAPI.removeFromFolder(promptId, folderId)
}