// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          theme_preference: 'light' | 'dark' | 'system'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          theme_preference?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          theme_preference?: 'light' | 'dark' | 'system'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          role_field: string
          personality_field: string | null
          instruction_field: string
          context_field: string | null
          example_field: string | null
          meta_prompt: string | null
          is_favorite: boolean
          usage_count: number
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          role_field: string
          personality_field?: string | null
          instruction_field: string
          context_field?: string | null
          example_field?: string | null
          meta_prompt?: string | null
          is_favorite?: boolean
          usage_count?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          role_field?: string
          personality_field?: string | null
          instruction_field?: string
          context_field?: string | null
          example_field?: string | null
          meta_prompt?: string | null
          is_favorite?: boolean
          usage_count?: number
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_folders: {
        Row: {
          id: string
          prompt_id: string
          folder_id: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          folder_id: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          folder_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_folders_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_folders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Folder = Database['public']['Tables']['folders']['Row']
export type FolderInsert = Database['public']['Tables']['folders']['Insert']
export type FolderUpdate = Database['public']['Tables']['folders']['Update']

export type Prompt = Database['public']['Tables']['prompts']['Row']
export type PromptInsert = Database['public']['Tables']['prompts']['Insert']
export type PromptUpdate = Database['public']['Tables']['prompts']['Update']

export type PromptFolder = Database['public']['Tables']['prompt_folders']['Row']
export type PromptFolderInsert = Database['public']['Tables']['prompt_folders']['Insert']
export type PromptFolderUpdate = Database['public']['Tables']['prompt_folders']['Update']

// Extended types with relationships
export type PromptWithFolders = Prompt & {
  prompt_folders?: (PromptFolder & { folders?: Folder })[]
  folders?: Folder[]
}

export type FolderWithPromptCount = Folder & {
  prompt_count?: number
  prompts?: Prompt[]
}

export type PromptFormData = {
  title: string
  role: string
  personality?: string
  instruction: string
  context?: string
  example?: string
}