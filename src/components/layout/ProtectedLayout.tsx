'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader, Menu } from 'lucide-react';

interface ProtectedLayoutProps {
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
}

export function ProtectedLayout({ children, title, hideHeader }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, authLoading, checkAuth } = useChatStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // checkAuth is called via authChecked effect above

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (authChecked && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, authChecked, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <main className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        {!hideHeader && (
          <Header
            title={title}
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
        )}
        {/* Floating hamburger button on mobile when header is hidden */}
        {hideHeader && (
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-lg bg-white shadow-md border border-border hover:bg-muted transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
