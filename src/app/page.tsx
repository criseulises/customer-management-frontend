'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard apropiado
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user?.role === 'SUPERADMIN') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'ADMIN') {
        router.push('/dashboard');
      }
    } else {
      // Si no está autenticado, redirigir al login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}