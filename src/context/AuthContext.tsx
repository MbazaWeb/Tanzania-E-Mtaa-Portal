import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, UserProfile } from '@/src/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    console.log('AuthContext: fetchUserProfile called for userId:', userId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });
      
      if (error) {
        console.error('RPC error:', error);
        throw error;
      } else if (data && Array.isArray(data) && data.length > 0) {
        console.log('User profile fetched successfully:', data[0]);
        setUser(data[0] as UserProfile);
      } else if (data && !Array.isArray(data)) {
        // In case RPC returns a single object instead of array
        console.log('User profile fetched (single object):', data);
        setUser(data as UserProfile);
      } else {
        console.log('No user profile found in database');
        setUser(null);
      }
    } catch (err: any) {
      console.error('Exception in fetchUserProfile:', err);
      setUser(null);
    } finally {
      console.log('AuthContext: fetchUserProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Handle invalid refresh token error
      if (error && error.message?.includes('Refresh Token')) {
        console.warn('Invalid refresh token, clearing session');
        supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Refresh the current user's profile from the database
  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, setUser, fetchUserProfile, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}