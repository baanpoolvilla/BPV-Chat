import { create } from 'zustand';
import { Conversation, Message, User, Stats } from '@/types';
import {
  conversationsAPI,
  messagesAPI,
  dashboardAPI,
  authAPI,
  lineAPI,
} from '@/lib/api';

interface ChatStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Conversations
  conversations: Conversation[];
  selectedConversationId: string | null;
  conversationFilter: 'all' | 'open' | 'pending' | 'resolved';
  searchQuery: string;
  conversationsLoading: boolean;
  fetchConversations: (silent?: boolean) => Promise<void>;
  refreshConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  setConversationFilter: (filter: 'all' | 'open' | 'pending' | 'resolved') => void;
  setSearchQuery: (query: string) => void;

  // Messages
  messagesLoading: boolean;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  setConversationLabels: (conversationId: string, labels: Conversation['labels']) => Promise<void>;
  updateConversationStatus: (
    conversationId: string,
    status: 'open' | 'pending' | 'resolved' | 'archived'
  ) => Promise<void>;

  // Stats
  stats: Stats | null;
  statsLoading: boolean;
  fetchStats: () => Promise<void>;

  // UI State
  showConfirmDialog: boolean;
  confirmDialogData: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null;
  setShowConfirmDialog: (show: boolean, data?: any) => void;

  // New message subscription
  subscribeToNewMessages: (callback: (message: Message) => void) => void;
  addMessageToConversation: (conversationId: string, message: Message) => void;

  // Track recent manual toggles (prevent polling race condition)
  recentToggles: Map<string, number>;

  // Unread tracking
  totalUnreadCount: number;
  markConversationRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  authLoading: true,

  // Track recent manual toggles
  recentToggles: new Map<string, number>(),

  // Unread tracking
  totalUnreadCount: 0,

  markConversationRead: (conversationId: string) => {
    try {
      const conv = get().conversations.find((c) => c.id === conversationId);
      const totalMessages = (conv as any)?.totalMessages || conv?.messages?.length || 0;
      const stored = JSON.parse(localStorage.getItem('readCounts') || '{}');
      stored[conversationId] = totalMessages;
      localStorage.setItem('readCounts', JSON.stringify(stored));

      // Update unread count in store
      const conversations = get().conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      );
      const totalUnreadCount = conversations.filter((c) => c.unreadCount > 0).length;
      set({ conversations, totalUnreadCount });
    } catch (e) {
      console.error('Failed to mark conversation read:', e);
    }
  },

  login: async (email: string, password: string) => {
    set({ authLoading: true });
    try {
      const { user, token } = await authAPI.login(email, password);
      set({
        user,
        isAuthenticated: true,
        authLoading: false,
      });
      localStorage.setItem('auth_token', token);
    } catch (error) {
      set({ authLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authAPI.logout();
    set({
      user: null,
      isAuthenticated: false,
      conversations: [],
      selectedConversationId: null,
    });
    localStorage.removeItem('auth_token');
  },

  checkAuth: async () => {
    // ถ้า authenticated อยู่แล้ว ไม่ต้อง check ซ้ำ (กัน authLoading flash)
    if (get().isAuthenticated && get().user) {
      set({ authLoading: false });
      return;
    }
    set({ authLoading: true });
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        set({ isAuthenticated: false, authLoading: false });
        return;
      }

      // Check if we have a stored user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({
          user,
          isAuthenticated: true,
          authLoading: false,
        });
        return;
      }

      // Try to fetch user from API
      const user = await authAPI.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        authLoading: false,
      });
    } catch (error) {
      set({ isAuthenticated: false, authLoading: false });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Conversations
  conversations: [],
  selectedConversationId: null,
  conversationFilter: 'all',
  searchQuery: '',
  conversationsLoading: false,

  fetchConversations: async (silent?: boolean) => {
    if (!silent) set({ conversationsLoading: true });
    try {
      const { conversationFilter, searchQuery } = get();
      const filters: any = {};

      if (conversationFilter !== 'all') {
        filters.status = conversationFilter;
      }
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const conversations = await conversationsAPI.getAll(filters);

      // Resolve LINE display names (เรียก LINE Profile API ผ่าน Next.js proxy)
      const enrichedConversations = await lineAPI.resolveConversationNames(conversations);

      // ตอน poll → เก็บ status เดิมถ้าเพิ่ง toggle (กัน API ทับหลัง toggle)
      const existingConversations = get().conversations;
      const TOGGLE_GRACE_MS = 30000; // 30 วินาที หลัง toggle จะไม่รับ status จาก API
      const now = Date.now();
      const recentToggles = get().recentToggles;

      const mergedConversations = enrichedConversations.map((newConv) => {
        const existing = existingConversations.find((c) => c.id === newConv.id);
        if (existing) {
          let resolvedStatus = newConv.status;
          // ใช้ grace period ทั้ง silent และ non-silent fetch
          const toggledAt = recentToggles.get(existing.id);
          const recentlyToggled = toggledAt && (now - toggledAt) < TOGGLE_GRACE_MS;
          if (recentlyToggled) {
            // อยู่ใน grace period → เก็บ status ที่ toggle ไว้
            resolvedStatus = existing.status;
          }
          return {
            ...newConv,
            messages: existing.messages.length > 0 ? existing.messages : newConv.messages,
            status: resolvedStatus,
          };
        }
        return newConv;
      });

      // คำนวณ unreadCount จาก totalMessages vs readCounts ใน localStorage
      let readCounts: Record<string, number> = {};
      try { readCounts = JSON.parse(localStorage.getItem('readCounts') || '{}'); } catch (e) {}

      const withUnread = mergedConversations.map((conv) => {
        const totalMessages = (conv as any).totalMessages || 0;
        const lastRead = readCounts[conv.id] || 0;
        const unread = Math.max(0, totalMessages - lastRead);
        return { ...conv, unreadCount: unread };
      });

      const totalUnreadCount = withUnread.filter((c) => c.unreadCount > 0).length;
      set({ conversations: withUnread, conversationsLoading: false, totalUnreadCount });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      if (!silent) set({ conversationsLoading: false });
      if (!silent) throw error;
    }
  },

  refreshConversations: async () => {
    // Silent refresh — just call fetchConversations with silent=true
    await get().fetchConversations(true);
  },

  selectConversation: async (id: string) => {
    set({ selectedConversationId: id, messagesLoading: false });

    // Mark as read ทันทีที่เลือก conversation
    get().markConversationRead(id);

    // Messages มากับ conversations แล้ว — ไม่ต้อง fetch แยก
    const existingConversation = get().conversations.find((c) => c.id === id);
    if (existingConversation && existingConversation.unreadCount > 0) {
      const conversations = get().conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      );
      set({ conversations });
    }
  },

  setConversationFilter: (filter: 'all' | 'open' | 'pending' | 'resolved') => {
    set({ conversationFilter: filter, searchQuery: '' });
    get().fetchConversations();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Messages
  messagesLoading: false,

  sendMessage: async (conversationId: string, content: string) => {
    try {
      // Optimistic update — แสดงข้อความทันทีก่อน API ตอบกลับ
      const currentUser = get().user;
      const adminName = currentUser?.name || 'Admin';
      const tempMessage: Message = {
        id: 'temp_' + Date.now(),
        conversationId,
        senderType: 'admin',
        type: 'admin',
        direction: 'outbound',
        messageType: 'text',
        contentText: content,
        content,
        sender: { id: currentUser?.id || 'admin', name: adminName, type: 'admin' },
        timestamp: new Date().toISOString(),
        isRead: true,
      };

      // เพิ่มข้อความ temp เข้า UI ทันที
      const convsBefore = get().conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, tempMessage],
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
          };
        }
        return c;
      });
      set({ conversations: convsBefore });

      // ส่งไป N8N จริง
      const savedMessage = await messagesAPI.send(conversationId, content);

      // อัพเดต readCount เพื่อไม่ให้ข้อความ admin ตัวเองนับเป็น unread
      get().markConversationRead(conversationId);

      // แทนที่ temp message ด้วย message จริงที่ได้จาก API (ถ้าได้ข้อมูลกลับมา)
      if (savedMessage && savedMessage.id) {
        const convsAfter = get().conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === tempMessage.id ? { ...savedMessage, conversationId } : m
              ),
            };
          }
          return c;
        });
        set({ conversations: convsAfter });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // ลบ temp message ออกถ้าส่งไม่สำเร็จ
      const convsRollback = get().conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.filter((m) => !m.id.startsWith('temp_')),
          };
        }
        return c;
      });
      set({ conversations: convsRollback });
      throw error;
    }
  },

  setConversationLabels: async (conversationId: string, labels: Conversation['labels']) => {
    const previous = get().conversations;
    const optimistic = previous.map((c) =>
      c.id === conversationId ? { ...c, labels } : c
    );
    set({ conversations: optimistic });

    try {
      const savedLabels = await conversationsAPI.updateTags(conversationId, labels);
      const updated = get().conversations.map((c) =>
        c.id === conversationId ? { ...c, labels: savedLabels } : c
      );
      set({ conversations: updated });
    } catch (error) {
      console.error('Failed to update labels:', error);
      set({ conversations: previous });
      throw error;
    }
  },

  updateConversationStatus: async (
    conversationId: string,
    status: 'open' | 'pending' | 'resolved' | 'archived'
  ) => {
    try {
      await conversationsAPI.updateStatus(conversationId, status);

      // Update only the status, preserve in-memory messages
      const conversations = get().conversations.map((c) =>
        c.id === conversationId ? { ...c, status } : c
      );

      set({ conversations });
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  },

  // Stats
  stats: null,
  statsLoading: false,

  fetchStats: async () => {
    set({ statsLoading: true });
    try {
      const stats = await dashboardAPI.getStats();
      set({ stats, statsLoading: false });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      set({ statsLoading: false });
      throw error;
    }
  },

  // UI State
  showConfirmDialog: false,
  confirmDialogData: null,

  setShowConfirmDialog: (show: boolean, data?: any) => {
    set({
      showConfirmDialog: show,
      confirmDialogData: data || null,
    });
  },

  // New message subscription
  subscribeToNewMessages: (callback: (message: Message) => void) => {
    // Placeholder for socket subscription
  },

  addMessageToConversation: (conversationId: string, message: Message) => {
    const conversations = get().conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, message],
          lastMessage: message.content,
          lastMessageAt: message.timestamp,
        };
      }
      return c;
    });

    set({ conversations });
  },
}));
