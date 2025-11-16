# Supabase Authentication Setup Guide

This guide will walk you through setting up Supabase for authentication in the OneSIM project.

## Prerequisites

1. A Supabase account ([supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

4. Add these to your environment variables:
   - For local development, create a `.env` file in the project root:
     ```env
     REACT_APP_SUPABASE_URL=your_project_url_here
     REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
     ```
   - For Vercel deployment, add these as environment variables in your Vercel project settings

## Step 2: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider and ensure it's enabled
3. **IMPORTANT:** Enable **Confirm email** option
   - This will require users to verify their email via OTP before login
4. Save the changes

## Step 3: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template if desired
3. The default template works fine, but you can brand it with your company info

## Step 4: Create the Profiles Table

The profiles table stores additional user information beyond what Supabase Auth provides.

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy and paste the following SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **Run** to execute the SQL
5. You should see a success message

## Step 5: Verify Email Settings

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to your production domain (e.g., `https://onesim.vercel.app`)
3. Add redirect URLs if needed:
   - For local development: `http://localhost:3000/login`
   - For production: `https://yourdomain.com/login`

## Step 6: Configure Email Rate Limiting (Optional)

1. Go to **Authentication** → **Rate Limits**
2. Review and adjust rate limits for:
   - Email sending
   - OTP attempts
3. Default values are usually fine for most applications

## Step 7: Test the Authentication Flow

1. Start your development server: `npm start`
2. Navigate to `/signup`
3. Create a test account
4. Check your email for the verification code
5. Enter the OTP code
6. Try logging in with your credentials

## Troubleshooting

### Email OTP Not Received

1. Check your spam folder
2. Verify that email provider is enabled in Supabase
3. Check **Authentication** → **Logs** for any errors
4. Ensure "Confirm email" is enabled in Email provider settings

### Profile Not Created Automatically

1. Check if the trigger was created successfully
2. Go to **Database** → **Functions** and verify `handle_new_user` exists
3. Check **Database** → **Triggers** and verify `on_auth_user_created` exists
4. Review database logs for any errors

### "Invalid API key" Error

1. Double-check your environment variables
2. Ensure you're using the **anon/public** key, not the service_role key
3. Restart your development server after adding environment variables

### CORS Errors

1. Go to **Authentication** → **URL Configuration**
2. Add your local development URL to redirect URLs
3. Ensure Site URL is set correctly

## Security Best Practices

1. **Never** commit `.env` file to git
2. Use the `service_role` key only on the server-side, never in client code
3. Always use Row Level Security (RLS) policies on your tables
4. Regularly review authentication logs
5. Enable email confirmation for production
6. Set appropriate rate limits

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## Environment Variables Summary

Add these to Vercel:

```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here
```

That's it! Your Supabase authentication should now be fully configured and ready to use.
