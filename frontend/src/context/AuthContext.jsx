import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabaseClient';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(authUser) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load profile:', error.message);
        setUser({
          ...authUser,
          full_name: authUser.user_metadata?.full_name || '',
          avatar_url: null,
          gender: null,
          date_of_birth: null,
          isAdmin: false,
        });
      } else {
        // Set language from profile preference
        if (profile?.preferred_language && ['bn', 'en'].includes(profile.preferred_language)) {
          i18n.changeLanguage(profile.preferred_language);
          localStorage.setItem('i18nextLng', profile.preferred_language);
        }

        const fullName = profile?.name || authUser.user_metadata?.full_name || '';
        let photo = profile?.profile_photo_url || null;
        if (photo && photo.includes('name=User')) {
          photo = photo.replace('name=User', `name=${encodeURIComponent(fullName)}`);
        }

        setUser({
          ...authUser,
          ...profile,
          full_name: fullName,
          avatar_url: photo,
          isAdmin: profile?.is_admin || false,
        });
      }
    } catch (err) {
      console.error('Profile load error:', err.message);
      setUser({
        ...authUser,
        full_name: authUser.user_metadata?.full_name || '',
        avatar_url: null,
        gender: null,
        date_of_birth: null,
        isAdmin: false,
      });
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password, fullName, dob, gender) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: fullName,
          gender: gender || null,
          date_of_birth: dob || null,
          profile_photo_url: null,
          is_admin: false,
        });

      if (profileError) {
        console.error('Profile insert error:', profileError.message);
      }
    }

    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, logoutUser: signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
