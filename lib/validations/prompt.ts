import * as z from "zod"

export const promptFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  
  role: z
    .string()
    .min(1, "Role is required")
    .max(500, "Role must be less than 500 characters")
    .describe("Define the role or persona the AI should adopt"),
  
  personality: z
    .string()
    .max(500, "Personality must be less than 500 characters")
    .optional()
    .describe("Describe personality traits and communication style"),
  
  instruction: z
    .string()
    .min(1, "Instructions are required")
    .max(2000, "Instructions must be less than 2000 characters")
    .describe("Clear instructions for what the AI should do"),
  
  context: z
    .string()
    .max(2000, "Context must be less than 2000 characters")
    .optional()
    .describe("Additional context or background information"),
  
  example: z
    .string()
    .max(2000, "Examples must be less than 2000 characters")
    .optional()
    .describe("Examples of desired input/output or formatting"),
})

export const folderFormSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Folder name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Folder name can only contain letters, numbers, spaces, hyphens, and underscores"),
  
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  
  color: z.enum([
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "pink",
    "indigo",
    "gray"
  ]).default("blue"),
})

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long"),
  
  filters: z.object({
    folders: z.array(z.string()).optional(),
    favorites: z.boolean().optional(),
    dateRange: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
  }).optional(),
})

export type PromptFormData = z.infer<typeof promptFormSchema>
export type FolderFormData = z.infer<typeof folderFormSchema>
export type SearchData = z.infer<typeof searchSchema>

// Helper function to estimate token count (rough approximation)
export function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}

// Helper function to validate total prompt size
export function validatePromptSize(data: PromptFormData): {
  isValid: boolean
  estimatedTokens: number
  message?: string
} {
  const totalText = [
    data.role,
    data.personality || "",
    data.instruction,
    data.context || "",
    data.example || ""
  ].join(" ")
  
  const estimatedTokens = estimateTokenCount(totalText)
  const maxTokens = 4000 // Conservative limit for most LLMs
  
  if (estimatedTokens > maxTokens) {
    return {
      isValid: false,
      estimatedTokens,
      message: `Prompt is too long. Estimated ${estimatedTokens} tokens (max ${maxTokens})`
    }
  }
  
  return {
    isValid: true,
    estimatedTokens
  }
}