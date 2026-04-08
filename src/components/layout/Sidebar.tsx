'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/utils/cn';
import {
  Home,
  MessagesSquare,
  Bot,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

// Custom channel icons
function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, totalUnreadCount } = useChatStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['chatbot']);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleNavigate = (href?: string) => {
    if (!href) return;
    onClose?.();
    router.push(href);
  };

  type NavChildItem = {
    href: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    soon?: boolean;
  };

  type NavItem = {
    id: string;
    href?: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    highlight?: boolean;
    labelRight?: string;
    soon?: boolean;
    children?: NavChildItem[];
  };

  const navItems: NavItem[] = [
    {
      id: 'home',
      href: '/dashboard',
      label: 'หน้าหลัก',
      icon: Home,
    },
    {
      id: 'chat',
      href: '/conversations',
      label: 'รวมแชท',
      icon: MessagesSquare,
      highlight: true,
    },
    {
      id: 'settings',
      href: '/settings',
      label: 'ตั้งค่าการเชื่อมต่อ',
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className="p-4 border-b border-sidebar-hover">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm truncate">Baanpool Chatbot</h1>
          </div>
          {/* Mobile close button */}
          <button onClick={onClose} className="md:hidden text-sidebar-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Social channel icons */}
      <div className="px-4 py-3 border-b border-sidebar-hover flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#1877f2] flex items-center justify-center">
          <FacebookIcon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="w-6 h-6 rounded-full bg-[#06c755] flex items-center justify-center">
          <LineIcon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
          <InstagramIcon className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
          <TikTokIcon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : item.children?.some((c) => pathname === c.href);
          const isExpanded = expandedMenus.includes(item.id);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.id}>
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'text-white bg-sidebar-hover'
                      : 'text-sidebar-foreground hover:text-white hover:bg-sidebar-hover'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {'labelRight' in item && (
                    <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] rounded-md font-medium">
                      {item.labelRight}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                    isActive
                      ? 'text-primary bg-sidebar-hover sidebar-active-indicator'
                      : 'text-sidebar-foreground hover:text-white hover:bg-sidebar-hover',
                    item.highlight && !isActive && 'text-primary'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.id === 'chat' && totalUnreadCount > 0 && (
                    <span className="min-w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 animate-pulse">
                      {totalUnreadCount}
                    </span>
                  )}
                  {'soon' in item && item.soon && (
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-md font-medium">
                      Soon
                    </span>
                  )}
                </button>
              )}

              {/* Children */}
              {hasChildren && isExpanded && (
                <div className="animate-slide-in">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = pathname === child.href;
                    return (
                      <button
                        type="button"
                        key={child.href}
                        onClick={() => handleNavigate(child.href)}
                        className={cn(
                          'w-full flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors text-left',
                          isChildActive
                            ? 'text-primary'
                            : 'text-sidebar-foreground hover:text-white'
                        )}
                      >
                        <ChildIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{child.label}</span>
                        {'soon' in child && (child as any).soon && (
                          <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-md font-medium">
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-hover">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:text-white hover:bg-sidebar-hover rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'md:hidden fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50 transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar flex-col fixed left-0 top-0 h-screen z-50">
        {sidebarContent}
      </aside>
    </>
  );
}
