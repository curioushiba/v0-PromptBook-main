// Database Models
export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  role_field: string;
  personality_field?: string;
  instruction_field: string;
  context_field?: string;
  example_field?: string;
  meta_prompt: string;
  is_favorite: boolean;
  usage_count: number;
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// UI Models
export interface PromptUIDisplay {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  gradient: string;
  isFavorite: boolean;
  usageCount: number;
}

export interface FolderUIDisplay {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  icon?: string;
}

// API Request/Response Types
export interface CreatePromptRequest {
  title: string;
  role: string;
  personality?: string;
  instruction: string;
  context?: string;
  example?: string;
  metaPrompt: string;
}

export interface UpdatePromptRequest extends Partial<CreatePromptRequest> {
  id: string;
}

export interface PromptQueryParams {
  search?: string;
  folderId?: string;
  isFavorite?: boolean;
  orderBy?: 'created_at' | 'updated_at' | 'title' | 'usage_count';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PromptsResponse {
  prompts: Prompt[];
  total?: number;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: string;
}

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

// Form Data Types
export interface PromptFormData {
  title?: string;
  role: string;
  personality?: string;
  instruction: string;
  context?: string;
  example?: string;
}

// Component Props Types
export interface PromptEditorProps {
  onGenerate: (data: PromptFormData) => Promise<string>;
  onSave: (prompt: PromptFormData & { metaPrompt: string }) => Promise<void>;
  isGenerating: boolean;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export interface NavigationBarProps {
  activeRoute?: string;
}

// Environment Variables Type
export interface EnvironmentVariables {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  DEBUG?: string;
}