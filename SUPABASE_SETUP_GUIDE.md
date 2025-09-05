# Supabase Database Setup Guide

## 🚨 Issue Resolved: Database Schema Deployment

The original `supabase-schema.sql` failed because it tried to create a trigger on `auth.users`, which requires superuser privileges that regular Supabase users don't have.

## ✅ Solution: Fixed Schema + Profile Creation Options

### Step 1: Deploy the Database Schema

**Choose the right file based on your situation:**

#### 🆕 **New Database** (Recommended)
Use `supabase-schema-fixed.sql` for fresh setups:
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste contents of `supabase-schema-fixed.sql`
3. Click **Run**

#### 🔄 **Existing Database** (If you get any migration errors)
Use `supabase-final-fix.sql` for existing setups:
1. Go to **SQL Editor** in Supabase Dashboard  
2. Copy and paste contents of `supabase-final-fix.sql`
3. Click **Run**

✅ This version handles all known PostgreSQL conflicts!

### Step 2: Choose Your Profile Creation Method

You now have **3 options** for handling user profile creation:

---

## Option 1: Database Webhook (Recommended) 🌟

**Best for production environments**

### Setup Steps:

1. **Create the webhook in Supabase Dashboard**:
   - Go to **Database** → **Webhooks**
   - Click **Create a new Hook**
   - Configure:
     ```
     Name: Create User Profile
     Table: auth.users
     Events: Insert
     Type: HTTP Request
     Method: POST
     URL: https://your-app-url.vercel.app/api/webhooks/create-profile
     ```

2. **Add webhook security** (recommended):
   - In webhook HTTP Headers, add:
     ```
     Authorization: Bearer your-secret-webhook-token
     ```
   - Add to your `.env.local`:
     ```env
     SUPABASE_WEBHOOK_SECRET=your-secret-webhook-token
     ```

3. **Deploy your app** with the webhook handler (already created at `app/api/webhooks/create-profile/route.ts`)

### How it works:
- When a user signs up → Supabase triggers webhook → Your app creates profile
- Completely automatic and reliable
- Works with email confirmation flows

---

## Option 2: Application-Level Creation 🔧

**Good for development and simple setups**

### How it works:
The updated `lib/supabase/auth.ts` now automatically:
- Creates profiles during signup (if email confirmation is disabled)
- Ensures profiles exist during signin (fallback mechanism)
- Provides manual profile creation utilities

### No additional setup required!
Just use the existing auth functions:

```typescript
// This will now automatically create a profile
const { data, error } = await auth.signUp(email, password, {
  firstName: 'John',
  lastName: 'Doe'
})

// This will ensure profile exists
const { data, error } = await auth.signIn(email, password)
```

---

## Option 3: Manual Profile Management 🛠️

**For custom flows or troubleshooting**

Use the profile utilities directly:

```typescript
import { profile } from '@/lib/supabase/auth'

// Create profile manually
await profile.createProfile(user)

// Ensure profile exists
await profile.ensureProfileExists(userId)

// Get profile
const { profile: userProfile } = await profile.getProfile(userId)
```

---

## Environment Variables Setup

Add these to your `.env.local`:

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Required for AI features - At least one
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Optional - Webhook Security (if using Option 1)
SUPABASE_WEBHOOK_SECRET=your-secret-token

# Optional - App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=false
```

## Testing the Setup

### 1. Run the fixed schema:
```sql
-- This should work without errors now
\i supabase-schema-fixed.sql
```

### 2. Test profile creation:

**Option A: Via webhook** (if configured)
```bash
# Test webhook endpoint
curl -X GET https://your-app-url.vercel.app/api/webhooks/create-profile
```

**Option B: Via application**
```typescript
// Sign up a test user
const { data, error } = await auth.signUp('test@example.com', 'password123')

// Check if profile was created
const { profile } = await profile.getProfile(data.user.id)
console.log('Profile created:', profile)
```

### 3. Verify database tables:
```sql
-- Check that all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: profiles, folders, prompts, prompt_folders
```

## Troubleshooting

### ❌ Error: "relation already exists" 
**Solution**: Use the migration-safe version:
1. Use `supabase-final-fix.sql` instead
2. This version safely handles existing tables
3. It will only create what doesn't exist
4. All policies and indexes will be updated properly

### ❌ Error: "column reference is ambiguous"
**This is the latest error you're seeing!**

**Solution**: Use the final fix:
1. Use `supabase-final-fix.sql` 
2. This version fixes PostgreSQL naming conflicts
3. Resolves ambiguous column/parameter name issues
4. Should execute without any errors

### ❌ Schema deployment fails:
- Make sure you're using `supabase-schema-fixed.sql` for new databases
- Use `supabase-final-fix.sql` for existing databases (handles all errors)
- Check your Supabase project permissions

### ❌ Profile creation not working:
- Verify environment variables are set correctly
- Check browser/server console for error messages
- Try the manual profile creation option

### ❌ Webhook not triggering:
- Verify webhook URL is accessible from internet
- Check webhook logs in Supabase Dashboard
- Ensure proper authentication headers

### ❌ Permission denied errors:
- This usually means RLS policies aren't set up correctly
- The migration-safe script will fix this
- Make sure you're authenticated in your app when testing

## Next Steps

1. ✅ Deploy fixed schema
2. ✅ Choose profile creation method
3. ✅ Set up environment variables
4. ✅ Test user signup/signin flow
5. ✅ Verify profile creation works
6. 🚀 Your app is ready to use!

## Migration from Old Schema

If you previously ran the original schema, you may need to:

1. Drop the old trigger (if it exists):
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   ```

2. Run the fixed schema

3. Manually create profiles for existing users:
   ```sql
   INSERT INTO public.profiles (id, email, full_name)
   SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
   FROM auth.users
   WHERE id NOT IN (SELECT id FROM public.profiles);
   ```
