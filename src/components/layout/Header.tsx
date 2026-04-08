'use client';

import { useChatStore } from '@/store/useChatStore';
import { Bell, Menu, Globe } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user } = useChatStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <h1 className="text-lg font-semibold text-card-foreground">{title}</h1>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            0
          </span>
        </button>

        {/* Language */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors border border-border">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">TH</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}
