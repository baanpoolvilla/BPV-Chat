'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Search, Loader, Filter, Eye, EyeOff } from 'lucide-react';
import type { Channel } from '@/types';

// Channel icon components
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

function getChannelIcon(channel: Channel, size: string = 'h-4 w-4') {
  switch (channel) {
    case 'line':
      return <LineIcon className={cn(size, 'text-[#06c755]')} />;
    case 'facebook':
      return <FacebookIcon className={cn(size, 'text-[#1877f2]')} />;
    case 'instagram':
      return <InstagramIcon className={cn(size, 'text-[#e4405f]')} />;
    default:
      return null;
  }
}

export function ConversationList() {
  const {
    conversations,
    selectedConversationId,
    searchQuery,
    conversationsLoading,
    selectConversation,
    setSearchQuery,
    fetchConversations,
  } = useChatStore();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [searchQuery]);

  // Realtime polling — fetch conversation list every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true); // silent mode — no loading spinner
    }, 5000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  // Apply local filters
  const filteredConversations = conversations.filter((conv) => {
    // Channel filter
    if (channelFilter !== 'all' && conv.channel !== channelFilter) return false;
    // Read status filter
    if (readFilter === 'read' && conv.unreadCount > 0) return false;
    if (readFilter === 'unread' && conv.unreadCount === 0) return false;
    // Search
    if (!localSearchQuery) return true;
    const q = localSearchQuery.toLowerCase();
    return (
      (conv.customerName || '').toLowerCase().includes(q) ||
      (conv.customerEmail || '').toLowerCase().includes(q) ||
      (conv.labels || []).some((l) => l.name.toLowerCase().includes(q))
    );
  });

  const channels: { id: string; label: string; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'line', label: 'LINE', icon: <LineIcon className="h-3.5 w-3.5 text-[#06c755]" /> },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon className="h-3.5 w-3.5 text-[#1877f2]" /> },
    { id: 'instagram', label: 'IG', icon: <InstagramIcon className="h-3.5 w-3.5 text-[#e4405f]" /> },
  ];

  const totalUnread = conversations.filter((c) => c.unreadCount > 0).length;

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-border flex flex-col h-full">
      {/* Channel Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelFilter(ch.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-b-2 transition-colors',
                channelFilter === ch.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-card-foreground'
              )}
            >
              {ch.icon}
              <span>{ch.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ อีเมล ป้ายกำกับ..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/50 border-0"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFilters ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Read/Unread filter */}
        {showFilters && (
          <div className="flex gap-1 animate-slide-in">
            {[
              { id: 'all', label: 'ทั้งหมด', icon: null },
              { id: 'unread', label: 'ยังไม่อ่าน', icon: <EyeOff className="h-3 w-3" /> },
              { id: 'read', label: 'อ่านแล้ว', icon: <Eye className="h-3 w-3" /> },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setReadFilter(f.id)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  readFilter === f.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
            {totalUnread > 0 && (
              <span className="ml-auto text-xs text-primary font-medium">
                {totalUnread} ยังไม่อ่าน
              </span>
            )}
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {conversationsLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <Search className="h-8 w-8 mb-2 opacity-30" />
            <p>ไม่พบบทสนทนา</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={cn(
                  'w-full text-left px-3 py-3 transition-colors hover:bg-muted/50',
                  selectedConversationId === conversation.id && 'bg-primary/5 border-l-3 border-l-primary'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 overflow-hidden">
                      {conversation.customerAvatar ? (
                        <img src={conversation.customerAvatar} alt={conversation.customerName} className="w-full h-full object-cover" />
                      ) : (
                        (conversation.customerName || '?').charAt(0)
                      )}
                    </div>
                    {/* Channel indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5">
                      {getChannelIcon(conversation.channel, 'h-3.5 w-3.5')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        'text-sm truncate',
                        conversation.unreadCount > 0 ? 'font-bold text-card-foreground' : 'font-medium text-card-foreground'
                      )}>
                        {conversation.customerName}
                      </h3>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt || conversation.createdAt), {
                          addSuffix: false,
                          locale: th,
                        })}
                      </span>
                    </div>

                    <p className={cn(
                      'text-xs line-clamp-1 mb-1.5',
                      conversation.unreadCount > 0 ? 'text-card-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {conversation.lastMessage}
                    </p>

                    {/* Bottom row: labels + unread */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {/* Labels */}
                        {conversation.labels.slice(0, 2).map((label) => (
                          <span
                            key={label.id}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate max-w-16"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 animate-pulse">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
