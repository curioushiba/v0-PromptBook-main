-- Mage Craft Database Schema for Supabase
-- Generated: 2025-09-05
-- Purpose: Complete database schema for prompt management MVP

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create folders table for prompt organization
CREATE TABLE public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue' CHECK (color IN ('red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create prompts table (core entity)
CREATE TABLE public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Structured prompt fields (from PRD)
  title TEXT NOT NULL,
  role_field TEXT NOT NULL,
  personality_field TEXT,
  instruction_field TEXT NOT NULL,
  context_field TEXT,
  example_field TEXT,
  
  -- Generated meta prompt from LLM
  meta_prompt TEXT,
  
  -- Metadata
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(role_field, '') || ' ' || 
      coalesce(instruction_field, '') || ' ' ||
      coalesce(context_field, '') || ' ' ||
      coalesce(meta_prompt, '')
    )
  ) STORED
);

-- Create prompt_folders junction table (many-to-many)
CREATE TABLE public.prompt_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, folder_id)
);

-- Create indexes for performance
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX idx_prompts_is_favorite ON public.prompts(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_prompts_search ON public.prompts USING GIN(search_vector);
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_prompt_folders_prompt_id ON public.prompt_folders(prompt_id);
CREATE INDEX idx_prompt_folders_folder_id ON public.prompt_folders(folder_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders: Users can only manage their own folders
CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Prompts: Users can only manage their own prompts
CREATE POLICY "Users can view own prompts" ON public.prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Prompt Folders: Users can only manage assignments for their own prompts and folders
CREATE POLICY "Users can view own prompt folder assignments" ON public.prompt_folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own prompt folder assignments" ON public.prompt_folders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own prompt folder assignments" ON public.prompt_folders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
    ) AND EXISTS (
      SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
    )
  );

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_folders ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data for development (optional)
-- INSERT INTO public.folders (user_id, name, description, color) VALUES
--   ('00000000-0000-0000-0000-000000000000', 'Work Projects', 'Professional prompt templates', 'blue'),
--   ('00000000-0000-0000-0000-000000000000', 'Creative Writing', 'Story and content creation prompts', 'purple'),
--   ('00000000-0000-0000-0000-000000000000', 'Code Generation', 'Programming assistance prompts', 'green');