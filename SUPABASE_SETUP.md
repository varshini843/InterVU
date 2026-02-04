# Supabase Setup for InterVU

This guide will help you set up Supabase as the backend database for the InterVU application.

## 1. Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one.
2. Create a new project:
   - Click on "New Project"
   - Enter a name for your project (e.g., "InterVU")
   - Set a secure database password
   - Choose a region closest to your users
   - Click "Create new project"

## 2. Your Supabase Credentials

Your Supabase project has been created with the following credentials:

- **Project URL**: `https://mcvjvsprehdetbbcfjph.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdmp2c3ByZWhkZXRiYmNmanBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkyMjAsImV4cCI6MjA2NDcyNTIyMH0.ptvadATEgnl0D7HbNDWW3kQxzWS1LSfeCKeRGay1-Pg`

These credentials have already been added to your `config.js` file.

## 3. Configuration

The `config.js` file in your project has already been updated with your Supabase credentials:

```javascript
// In config.js
export const CONFIG = {
  // ... other config options ...
  
  // Supabase configuration
  SUPABASE: {
    URL: "https://mcvjvsprehdetbbcfjph.supabase.co",
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdmp2c3ByZWhkZXRiYmNmanBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkyMjAsImV4cCI6MjA2NDcyNTIyMH0.ptvadATEgnl0D7HbNDWW3kQxzWS1LSfeCKeRGay1-Pg",
    ENABLE: true
  },
  
  // ... other config options ...
};
```

## 4. Set Up Database Tables

You need to create the following tables in your Supabase database:

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Interviews Table

```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  questions JSONB,
  answers JSONB,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Resumes Table

```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Set Up Authentication

Supabase provides authentication out of the box. You can configure additional settings:

1. In your Supabase dashboard, go to "Authentication" in the left sidebar
2. Under "Providers", you can enable/disable different authentication methods
3. For email authentication:
   - Make sure "Email" is enabled
   - You can customize email templates under "Email Templates"

## 6. Set Up Row Level Security (RLS)

To secure your data, set up Row Level Security policies:

### Users Table

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update only their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Interviews Table

```sql
-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own interviews
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own interviews
CREATE POLICY "Users can insert their own interviews" ON interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own interviews
CREATE POLICY "Users can update their own interviews" ON interviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own interviews
CREATE POLICY "Users can delete their own interviews" ON interviews
  FOR DELETE USING (auth.uid() = user_id);
```

### Resumes Table

```sql
-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own resumes
CREATE POLICY "Users can view their own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own resumes
CREATE POLICY "Users can insert their own resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own resumes
CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own resumes
CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);
```

## 7. Testing

After setting up Supabase, test the authentication and database operations:

1. Register a new user through your application
2. Verify that the user is created in Supabase Auth and in your users table
3. Test creating and retrieving interviews and resumes

## Troubleshooting

- If you encounter CORS issues, make sure to add your application's URL to the allowed origins in Supabase:
  1. Go to "Settings" > "API" in your Supabase dashboard
  2. Under "Project Settings", add your application URL to "Additional Allowed Origins"

- For authentication issues, check the browser console for error messages and verify your Supabase credentials in the config file.

- For database operation issues, check the Supabase dashboard for SQL errors and verify your table structures and RLS policies.