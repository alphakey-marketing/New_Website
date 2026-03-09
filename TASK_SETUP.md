# Task Management System Setup Guide

## Phase 1: Supabase Setup & Authentication ✅

This phase adds Supabase authentication and protected task routes to your website.

### Prerequisites

1. **Create Supabase Project**
   - Go to [https://database.new](https://database.new)
   - Create a new project (remember your database password)
   - Wait for project initialization (~2 minutes)

2. **Run Database Schema**
   
   Go to your Supabase project → SQL Editor → New Query, then run:

   ```sql
   -- Create profiles table (extends auth.users)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Allow users to view their own profile
   CREATE POLICY "Users can view own profile" 
     ON profiles FOR SELECT 
     USING (auth.uid() = id);

   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile" 
     ON profiles FOR UPDATE 
     USING (auth.uid() = id);

   -- Function to automatically create profile on signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger AS $$
   BEGIN
     INSERT INTO public.profiles (id, email)
     VALUES (new.id, new.email);
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger to create profile automatically
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. **Configure Email Authentication**
   - In Supabase: Authentication → Providers → Email
   - Enable "Email" provider
   - **Optional**: Disable "Confirm email" for faster testing (re-enable for production)

### Replit Setup

1. **Install Dependencies**
   
   In Replit Shell, run:
   ```bash
   npm install
   ```

2. **Add Secrets to Replit**
   
   Go to Tools → Secrets, add these two secrets:

   **Secret 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase Project URL
     (Find in Supabase → Settings → API → Project URL)

   **Secret 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase Anon Public Key
     (Find in Supabase → Settings → API → Project API keys → anon public)

3. **Restart Development Server**
   
   Click the "Run" button in Replit to start the Next.js server.

### Testing Phase 1

1. Navigate to `/tasks` in your browser
2. You should be redirected to `/tasks/login`
3. Click "Don't have an account? Sign up"
4. Enter an email and password (min 6 characters)
5. If email confirmation is enabled, check your email and click the link
6. Sign in with your credentials
7. You should see the Task Management welcome page

### Troubleshooting

**Error: "Missing NEXT_PUBLIC_SUPABASE_URL"**
- Make sure you added both secrets to Replit
- Restart the server after adding secrets

**Sign up not working / No confirmation email**
- Check Supabase → Authentication → Providers → Email is enabled
- For testing, disable "Confirm email" option

**"Invalid login credentials"**
- Make sure you completed email confirmation if enabled
- Password must be at least 6 characters

### What's Next?

**Phase 2** (Next commit) will add:
- Task database schema
- Task creation form
- Task list view
- CRUD operations (Create, Read, Update, Delete)

### File Structure Added

```
src/
├── lib/
│   └── supabaseClient.ts       # Supabase initialization
├── types/
│   └── task.ts                 # TypeScript interfaces
└── pages/
    └── tasks/
        ├── login.tsx           # Authentication page
        └── index.tsx           # Protected tasks page
```

### Security Notes

- Never commit `.env` or expose your `SUPABASE_SERVICE_ROLE_KEY`
- The `anon` key is safe to use client-side (it's rate-limited)
- Row Level Security (RLS) ensures users only see their own data
- All authentication is handled by Supabase (secure by default)
