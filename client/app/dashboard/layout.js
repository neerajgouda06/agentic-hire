'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import api from '@/lib/api';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        if (!user) {
          const res = await api.get('/auth/me');
          initialize(res.data);
        }
      } catch (error) {
        logout();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, router, initialize, logout]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium tracking-wide">Loading AgentHire OS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/jobs', label: 'Jobs' },
    { href: '/dashboard/candidates', label: 'Candidates' },
    { href: '/dashboard/workflows', label: 'Workflows' },
    { href: '/dashboard/analytics', label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Top Glass Navbar (Light + Dark support) */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo-free Clean Wordmark & Main Nav */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center group">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  AgentHire
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile, Theme Toggle & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">{user?.name}</span>
              </div>

              <ThemeToggle />

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors duration-200 shadow-2xs"
              >
                Logout
              </Button>
            </div>

          </div>
        </div>
      </header>
      
      {/* Page Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
