'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePartnersStore } from '../store/partnersStore';

const PUBLIC_PATHS = ['/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loadUser, isAuthenticated, user } = useAuthStore();
  const { loadPartners } = usePartnersStore();

  useEffect(() => {
    // Restore session on mount
    loadUser().then(() => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
        router.replace('/');
      }
    });

    // Listen for auth state changes (login/logout from any tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, isAuthenticated: false });
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load partners whenever a real user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.id !== 'demo-user-1') {
      loadPartners();
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
}
