import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  firstName: string;
  profileType: string;
  pointsBalance: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { firstName: string; email: string; password: string; profileType: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updatePoints: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    set({
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: profile?.first_name ?? '',
        profileType: profile?.profile_type ?? 'SINGLE',
        pointsBalance: profile?.points_balance ?? 0,
      },
      isAuthenticated: true,
    });
  },

  signup: async ({ firstName, email, password, profileType }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { firstName, profileType } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Signup failed');

    // Profile is created by the DB trigger; fetch it
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    set({
      user: {
        id: data.user.id,
        email: data.user.email!,
        firstName: profile?.first_name ?? firstName,
        profileType: profile?.profile_type ?? profileType,
        pointsBalance: profile?.points_balance ?? 0,
      },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          firstName: profile.first_name ?? '',
          profileType: profile.profile_type ?? 'SINGLE',
          pointsBalance: profile.points_balance ?? 0,
        },
        isAuthenticated: true,
      });
    }
  },

  updatePoints: (newBalance) => {
    set(state => state.user ? { user: { ...state.user, pointsBalance: newBalance } } : {});
  },
}));
