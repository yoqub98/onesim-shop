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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('🔐 AuthProvider initializing...');
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          setUser(null);
          setUserProfile(null);
        } else if (session?.user) {
          console.log('✅ Found active session:', session.user.email);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('ℹ️ No active session');
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('💥 Unexpected error in auth initialization:', err);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        setSessionChecked(true);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in');
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setUserProfile(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        if (session?.user) {
          setUser(session.user);
        }
      } else if (event === 'USER_UPDATED' && session?.user) {
        console.log('🔄 User updated');
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      
      if (sessionChecked) {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [sessionChecked]);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('👤 Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        if (error.code !== 'PGRST116') {
          console.error('Profile error details:', error);
        }
        return null;
      }

      console.log('✅ Profile fetched:', data);
      setUserProfile(data);
      return data;
    } catch (err) {
      console.error('💥 Unexpected profile fetch error:', err);
      return null;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      console.log('📝 Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        return { data: null, error };
      }

      console.log('✅ Signup successful:', data);
      return { data, error: null };
    } catch (err) {
      console.error('💥 Unexpected signup error:', err);
      return { data: null, error: err };
    }
  };

  const verifyOtp = async (email, token) => {
    try {
      console.log('🔐 Verifying OTP for:', email);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        return { data: null, error };
      }

      console.log('✅ OTP verified successfully');
      return { data, error: null };
    } catch (err) {
      console.error('💥 Unexpected OTP verification error:', err);
      return { data: null, error: err };
    }
  };

  const resendOtp = async (email) => {
    try {
      console.log('🔄 Resending OTP to:', email);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('❌ Resend OTP error:', error);
        return { data: null, error };
      }

      console.log('✅ OTP resent successfully');
      return { data, error: null };
    } catch (err) {
      console.error('💥 Unexpected resend error:', err);
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        return { data: null, error };
      }

      console.log('✅ Sign in successful');
      setUser(data.user);
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }

      return { data, error: null };
    } catch (err) {
      console.error('💥 Unexpected sign in error:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      }

      console.log('✅ Sign out successful');
      setUser(null);
      setUserProfile(null);
      
      return { error: null };
    } catch (err) {
      console.error('💥 Unexpected sign out error:', err);
      setUser(null);
      setUserProfile(null);
      return { error: err };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    refreshProfile: () => user ? fetchUserProfile(user.id) : null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};