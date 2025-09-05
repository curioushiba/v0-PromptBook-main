-- Mage Craft Database Schema - MIGRATION SAFE VERSION
-- Generated: 2025-01-27
-- Purpose: Safe migration that handles existing tables
-- Use this if you get "relation already exists" errors

-- =====================================================
-- STEP 1: Clean up any problematic triggers first
-- =====================================================

-- Remove the old trigger that was causing permission issues (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =====================================================
-- STEP 2: Create tables only if they don't exist
-- =====================================================

-- Create custom profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create folders table for prompt organization
CREATE TABLE IF NOT EXISTS public.folders (
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
CREATE TABLE IF NOT EXISTS public.prompts (
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add search vector column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'prompts' 
        AND column_name = 'search_vector'
    ) THEN
        ALTER TABLE public.prompts ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
            to_tsvector('english', 
                coalesce(title, '') || ' ' || 
                coalesce(role_field, '') || ' ' || 
                coalesce(instruction_field, '') || ' ' ||
                coalesce(context_field, '') || ' ' ||
                coalesce(meta_prompt, '')
            )
        ) STORED;
    END IF;
END $$;

-- Create prompt_folders junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.prompt_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, folder_id)
);

-- =====================================================
-- STEP 3: Create indexes (skip if they exist)
-- =====================================================

-- Function to create index only if it doesn't exist
CREATE OR REPLACE FUNCTION create_index_if_not_exists(index_name text, table_name text, columns text)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = index_name
    ) THEN
        EXECUTE format('CREATE INDEX %I ON %I (%s)', index_name, table_name, columns);
    END IF;
END $$ LANGUAGE plpgsql;

-- Create indexes for performance
SELECT create_index_if_not_exists('idx_prompts_user_id', 'prompts', 'user_id');
SELECT create_index_if_not_exists('idx_prompts_created_at', 'prompts', 'created_at DESC');
SELECT create_index_if_not_exists('idx_prompts_is_favorite', 'prompts', 'user_id, is_favorite') WHERE is_favorite = TRUE;
SELECT create_index_if_not_exists('idx_folders_user_id', 'folders', 'user_id');
SELECT create_index_if_not_exists('idx_prompt_folders_prompt_id', 'prompt_folders', 'prompt_id');
SELECT create_index_if_not_exists('idx_prompt_folders_folder_id', 'prompt_folders', 'folder_id');

-- Create GIN index for search vector
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_prompts_search'
    ) THEN
        CREATE INDEX idx_prompts_search ON public.prompts USING GIN(search_vector);
    END IF;
END $$;

-- Clean up the helper function
DROP FUNCTION create_index_if_not_exists(text, text, text);

-- =====================================================
-- STEP 4: Create/Update trigger functions
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: Create triggers (drop and recreate to ensure they're correct)
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_folders_updated_at ON public.folders;
DROP TRIGGER IF EXISTS handle_prompts_updated_at ON public.prompts;

-- Create updated_at triggers
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STEP 6: Set up Row Level Security Policies
-- =====================================================

-- Function to create policy only if it doesn't exist
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    policy_definition text
)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name
    ) THEN
        EXECUTE policy_definition;
    END IF;
END $$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
SELECT create_policy_if_not_exists(
    'Users can view own profile',
    'profiles',
    'CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own profile',
    'profiles',
    'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)'
);

SELECT create_policy_if_not_exists(
    'Users can insert own profile',
    'profiles',
    'CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)'
);

-- Create policies for folders
SELECT create_policy_if_not_exists(
    'Users can view own folders',
    'folders',
    'CREATE POLICY "Users can view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can create own folders',
    'folders',
    'CREATE POLICY "Users can create own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own folders',
    'folders',
    'CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can delete own folders',
    'folders',
    'CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id)'
);

-- Create policies for prompts
SELECT create_policy_if_not_exists(
    'Users can view own prompts',
    'prompts',
    'CREATE POLICY "Users can view own prompts" ON public.prompts FOR SELECT USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can create own prompts',
    'prompts',
    'CREATE POLICY "Users can create own prompts" ON public.prompts FOR INSERT WITH CHECK (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can update own prompts',
    'prompts',
    'CREATE POLICY "Users can update own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id)'
);

SELECT create_policy_if_not_exists(
    'Users can delete own prompts',
    'prompts',
    'CREATE POLICY "Users can delete own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id)'
);

-- Create policies for prompt_folders
SELECT create_policy_if_not_exists(
    'Users can view own prompt folder assignments',
    'prompt_folders',
    'CREATE POLICY "Users can view own prompt folder assignments" ON public.prompt_folders FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
        )
    )'
);

SELECT create_policy_if_not_exists(
    'Users can create own prompt folder assignments',
    'prompt_folders',
    'CREATE POLICY "Users can create own prompt folder assignments" ON public.prompt_folders FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
        )
    )'
);

SELECT create_policy_if_not_exists(
    'Users can delete own prompt folder assignments',
    'prompt_folders',
    'CREATE POLICY "Users can delete own prompt folder assignments" ON public.prompt_folders FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prompts p WHERE p.id = prompt_id AND p.user_id = auth.uid()
        ) AND EXISTS (
            SELECT 1 FROM public.folders f WHERE f.id = folder_id AND f.user_id = auth.uid()
        )
    )'
);

-- Clean up the helper function
DROP FUNCTION create_policy_if_not_exists(text, text, text);

-- =====================================================
-- STEP 7: Create webhook helper function (optional)
-- =====================================================

-- Optional: Create the helper function for profile creation (for webhook use)
CREATE OR REPLACE FUNCTION public.handle_new_user_webhook(user_data jsonb)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    (user_data->>'id')::uuid,
    user_data->>'email',
    COALESCE(user_data->'raw_user_meta_data'->>'full_name', user_data->>'email')
  )
  ON CONFLICT (id) DO NOTHING; -- Don't fail if profile already exists
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Show what was created/updated
SELECT 
    'Tables created/verified:' as status,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'folders', 'prompts', 'prompt_folders');

SELECT 
    'Policies created:' as status,
    COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 
    'Indexes created:' as status,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';
