import axios, { AxiosInstance } from 'axios';
import { Conversation, Message, Stats, User, Tag } from '@/types';
import {
  generateMockConversations,
  getMockConversationById,
  filterConversations,
  generateMockMessage,
  mockStats,
} from '@/lib/mockData';

// ─────────────────────────────────────────────────────────────
// URL Configuration
//   NEXT_PUBLIC_MOCK_MODE=true   → ใช้ข้อมูลจาก mockData.ts
//   NEXT_PUBLIC_MOCK_MODE=false  → ใช้ Next.js API Routes (/api/db/...)
//                                   ต่อ Postgres โดยตรง (ไม่ผ่าน N8N)
//
// ตั้งค่าใน .env.local:
//   DATABASE_URL=postgresql://postgres:123456@<HOST>:5432/chatbot
//   LINE_CHANNEL_ACCESS_TOKEN=<token>
// ─────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== 'false';

// Axios instance สำหรับเรียก Next.js API routes (same-origin)
const dbClient: AxiosInstance = axios.create({
  baseURL: '/api/db',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Axios instance สำหรับ local Next.js API (auth ฯลฯ)
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const apiClient: AxiosInstance = axios.create({
  baseURL: LOCAL_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// เพิ่ม auth token อัตโนมัติ
const addAuthToken = (config: any) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
apiClient.interceptors.request.use(addAuthToken);
dbClient.interceptors.request.use(addAuthToken);

// ─────────────────────────────────────────────────────────────
// Auth APIs (local — ไม่ผ่าน N8N)
// ─────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    if (MOCK_MODE) {
      await delay(500);
      const user: User = {
        id: '1',
        email,
        name: capitalise(email.split('@')[0]),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'staff',
      };
      return { token: 'mock_token_' + Date.now(), user };
    }

    // TODO: สร้าง Next.js API route /api/auth/login หรือใช้ NextAuth
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User> => {
    if (MOCK_MODE) {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) return JSON.parse(raw);
      throw new Error('No user found');
    }
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Conversations APIs  →  Next.js API: /api/db/conversations
// ─────────────────────────────────────────────────────────────
export const conversationsAPI = {
  getAll: async (filters?: { status?: string; search?: string }): Promise<Conversation[]> => {
    if (MOCK_MODE) {
      await delay(300);
      return filterConversations(generateMockConversations(), filters?.status, filters?.search);
    }

    const response = await dbClient.get('/conversations', { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data.conversations || []);
  },

  getById: async (id: string): Promise<Conversation> => {
    if (MOCK_MODE) {
      await delay(200);
      const c = getMockConversationById(id);
      if (!c) throw new Error('Conversation not found');
      return c;
    }

    const msgResponse = await dbClient.get('/messages', { params: { conversationId: id } });
    const msgData = msgResponse.data;
    const messages: Message[] = Array.isArray(msgData) ? msgData : (msgData.messages || []);

    let convData: any = null;
    try {
      const listResponse = await dbClient.get('/conversations');
      const listData = listResponse.data;
      const convList = Array.isArray(listData) ? listData : (listData.conversations || []);
      convData = convList.find((c: any) => c.id === id);
    } catch { /* ignore */ }

    return {
      id,
      customerUserId: convData?.customerUserId || id,
      customerName: convData?.customerName || id,
      customerEmail: convData?.customerEmail || '',
      customerPhone: convData?.customerPhone || '',
      customerAvatar: convData?.customerAvatar || undefined,
      channel: convData?.channel || 'line',
      status: convData?.status || 'open',
      lastMessage: convData?.lastMessage || (messages.length > 0 ? messages[messages.length - 1].content : ''),
      lastMessageAt: convData?.lastMessageAt || (messages.length > 0 ? messages[messages.length - 1].timestamp : new Date().toISOString()),
      unreadCount: convData?.unreadCount || 0,
      messages,
      labels: convData?.labels || [],
      createdAt: convData?.createdAt || new Date().toISOString(),
      updatedAt: convData?.updatedAt || new Date().toISOString(),
    };
  },

  updateStatus: async (id: string, status: 'open' | 'pending' | 'resolved' | 'archived'): Promise<Conversation> => {
    if (MOCK_MODE) { await delay(300); return { id, status } as any; }
    // TODO: สร้าง endpoint ถ้าต้องการ persist status
    return { id, status } as any;
  },

  updateTags: async (
    id: string,
    labels: Array<{ id: string; name: string; color: string }>
  ): Promise<Array<{ id: string; name: string; color: string }>> => {
    if (MOCK_MODE) { await delay(250); return labels; }

    const response = await dbClient.post('/conversations/tags', {
      conversationId: id,
      tags: labels.map((label) => ({ name: label.name, color: label.color })),
    });

    const data = response.data;
    return Array.isArray(data?.labels) ? data.labels : labels;
  },

  markAsRead: async (id: string): Promise<void> => {
    if (MOCK_MODE) { await delay(100); }
  },

  getStats: async (): Promise<Stats> => {
    if (MOCK_MODE) { await delay(300); return mockStats; }
    const response = await dbClient.get('/dashboard/stats');
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Messages APIs  →  Next.js API: /api/db/messages
// ─────────────────────────────────────────────────────────────
export const messagesAPI = {
  getByConversation: async (conversationId: string): Promise<Message[]> => {
    if (MOCK_MODE) {
      await delay(200);
      return getMockConversationById(conversationId)?.messages || [];
    }

    const response = await dbClient.get('/messages', { params: { conversationId } });
    const data = response.data;
    let messages = Array.isArray(data) ? data : (data.messages || []);
    if (typeof messages === 'string') {
      try { messages = JSON.parse(messages); } catch { messages = []; }
    }
    return Array.isArray(messages) ? messages : [];
  },

  send: async (conversationId: string, content: string, type: 'admin' = 'admin'): Promise<Message> => {
    if (MOCK_MODE) {
      await delay(400);
      return generateMockMessage(conversationId, content, type);
    }

    const response = await dbClient.post('/messages', { conversationId, content, type });
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Dashboard APIs  →  Next.js API: /api/db/dashboard/stats
// ─────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: async (): Promise<Stats> => {
    if (MOCK_MODE) { await delay(300); return mockStats; }
    const response = await dbClient.get('/dashboard/stats');
    return response.data;
  },

  getRecentConversations: async (limit = 10): Promise<Conversation[]> => {
    if (MOCK_MODE) {
      await delay(300);
      return generateMockConversations().slice(0, limit);
    }

    const response = await dbClient.get('/conversations', {
      params: { limit, sort: 'recent' },
    });
    const data = response.data;
    return Array.isArray(data) ? data : (data.conversations || []);
  },
};

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─────────────────────────────────────────────────────────────
// LINE Profile Resolution  →  Next.js API: /api/line/profile/:userId
// จะ cache ผลใน memory เพื่อไม่ต้องเรียกซ้ำ
// ─────────────────────────────────────────────────────────────
const lineProfileCache = new Map<string, { displayName: string; pictureUrl?: string }>();

export const lineAPI = {
  /** ดึง LINE display name จาก API proxy (cached) */
  getProfile: async (userId: string): Promise<{ displayName: string; pictureUrl?: string }> => {
    if (!userId || !userId.startsWith('U')) {
      return { displayName: userId };
    }

    const cached = lineProfileCache.get(userId);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/line/profile/${userId}`);
      const data = await response.json();
      const profile = { displayName: data.displayName || userId, pictureUrl: data.pictureUrl };
      lineProfileCache.set(userId, profile);
      return profile;
    } catch {
      return { displayName: userId };
    }
  },

  /** Resolve LINE display names สำหรับ conversation list ทั้งหมด */
  resolveConversationNames: async (conversations: Conversation[]): Promise<Conversation[]> => {
    const lineConvs = conversations.filter(
      (c) => c.customerName?.startsWith('U') && c.channel === 'line'
    );

    if (lineConvs.length === 0) return conversations;

    // Fetch profiles in parallel
    const profiles = await Promise.all(
      lineConvs.map((c) => lineAPI.getProfile(c.customerName))
    );

    const profileMap = new Map<string, { displayName: string; pictureUrl?: string }>();
    lineConvs.forEach((c, i) => profileMap.set(c.id, profiles[i]));

    return conversations.map((c) => {
      const profile = profileMap.get(c.id);
      if (profile) {
        return {
          ...c,
          customerName: profile.displayName,
          customerAvatar: profile.pictureUrl || c.customerAvatar,
        };
      }
      return c;
    });
  },
};

// ─────────────────────────────────────────────────────────────
// Tags APIs  →  Next.js API: /api/db/tags
// ─────────────────────────────────────────────────────────────
export const tagsAPI = {
  getAll: async (): Promise<Tag[]> => {
    if (MOCK_MODE) { await delay(200); return []; }
    const response = await dbClient.get('/tags');
    const data = response.data;
    return Array.isArray(data) ? data : (data.tags || data || []);
  },

  create: async (name: string, color: string, scope: string = 'global'): Promise<Tag> => {
    if (MOCK_MODE) { await delay(200); return { id: Date.now().toString(), name, color, scope }; }
    const response = await dbClient.post('/tags', { name, color, scope });
    return response.data;
  },

  delete: async (tagId: string): Promise<void> => {
    if (MOCK_MODE) { await delay(200); return; }
    await dbClient.post('/tags/delete', { tagId });
  },
};

export default apiClient;
