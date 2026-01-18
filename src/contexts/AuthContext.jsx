// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Initial session check:', session ? 'Session found' : 'No session');
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);

      if (session?.user) {
        // For OAuth users, ensure profile exists
        if (event === 'SIGNED_IN' && session.user.app_metadata?.provider === 'google') {
          await ensureProfileForOAuthUser(session.user);
        }
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      console.log('[Auth] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error fetching profile:', error);
        throw error;
      }
      console.log('[Auth] Profile fetched successfully:', data?.email);
      setProfile(data);
    } catch (error) {
      console.error('[Auth] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure profile exists for OAuth users (Google Sign-In)
  const ensureProfileForOAuthUser = async (user) => {
    try {
      console.log('[Auth] Ensuring profile for OAuth user:', user.email);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('[Auth] Profile already exists for OAuth user');
        return;
      }

      // Extract name from Google user metadata
      const metadata = user.user_metadata || {};
      const fullName = metadata.full_name || metadata.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || metadata.given_name || '';
      const lastName = nameParts.slice(1).join(' ') || metadata.family_name || '';

      // Create profile for OAuth user
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          auth_provider: 'google',
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[Auth] Error creating profile for OAuth user:', error);
        throw error;
      }
      console.log('[Auth] Profile created for OAuth user:', user.email);
    } catch (error) {
      console.error('[Auth] Error in ensureProfileForOAuthUser:', error);
    }
  };

  const signUp = async (email, password, firstName, lastName, phone) => {
    console.log('[Auth] Signing up user:', email);
    // Database trigger will automatically create the profile
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          auth_provider: 'email',
          terms_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        }
      }
    });

    if (error) {
      console.error('[Auth] Signup error:', error);
      throw error;
    }
    console.log('[Auth] Signup successful, verification email sent');
    return data;
  };

  // Google OAuth Sign-In
  const signInWithGoogle = async () => {
    console.log('[Auth] Initiating Google Sign-In...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth] Google Sign-In error:', error);
      throw error;
    }
    console.log('[Auth] Google Sign-In initiated, redirecting...');
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};