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
//   NEXT_PUBLIC_MOCK_MODE=true   → ใช้ข้อมูลจาก mockData.ts (ว่างเปล่า)
//   NEXT_PUBLIC_MOCK_MODE=false  → ส่ง request ไป N8N จริง
//
// N8N Webhook endpoints (ตั้งค่าใน .env.local):
//   NEXT_PUBLIC_N8N_URL=http://<N8N_HOST>:5678/webhook
//
// Endpoints ที่ต้องสร้าง N8N workflow:
//   GET  /admin/conversations            → ดึง conversation list จาก chat_memory
//   GET  /admin/conversations/:id        → ดึง messages ของ conversation นั้น
//   POST /admin/messages/send            → admin ส่งข้อความ → LINE API
//   POST /admin/conversations/:id/tags   → อัปเดตป้ายกำกับลูกค้า LINE
//   GET  /admin/dashboard/stats          → ดึง count stats จาก Postgres
// ─────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== 'false';

// N8N webhook base URL — ใช้เมื่อ MOCK_MODE=false
const N8N_URL =
  process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678/webhook';

// Next.js API routes (auth ยังคงใช้ local — ไม่ผ่าน N8N)
const LOCAL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Axios instance สำหรับ N8N
const n8nClient: AxiosInstance = axios.create({
  baseURL: N8N_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Axios instance สำหรับ local Next.js API (auth ฯลฯ)
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
n8nClient.interceptors.request.use(addAuthToken);

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
// Conversations APIs  →  N8N: GET /admin/conversations
// ─────────────────────────────────────────────────────────────
export const conversationsAPI = {
  /** N8N workflow: query chat_memory GROUP BY user_id + join admin_takeover */
  getAll: async (filters?: { status?: string; search?: string }): Promise<Conversation[]> => {
    if (MOCK_MODE) {
      await delay(300);
      return filterConversations(generateMockConversations(), filters?.status, filters?.search);
    }

    // N8N webhook: GET /admin/conversations?status=bot&search=keyword
    const response = await n8nClient.get('/admin/conversations', { params: filters });
    // N8N returns { conversations: [...], total: N } — extract array
    const data = response.data;
    return Array.isArray(data) ? data : (data.conversations || []);
  },

  /**
   * N8N ไม่มี endpoint GET /admin/conversations/:id โดยตรง
   * → ใช้ข้อมูลจาก getAll ที่โหลดไว้แล้ว + ดึง messages จาก /messages endpoint
   */
  getById: async (id: string): Promise<Conversation> => {
    if (MOCK_MODE) {
      await delay(200);
      const c = getMockConversationById(id);
      if (!c) throw new Error('Conversation not found');
      return c;
    }

    // ดึง messages จาก N8N endpoint
    const response = await n8nClient.get('/admin/messages', { params: { conversationId: id } });
    const msgData = response.data;
    const messages: Message[] = Array.isArray(msgData) ? msgData : (msgData.messages || []);

    // ดึง conversation list เพื่อหาข้อมูล header (ถ้ายังไม่มี)
    let convData: any = null;
    try {
      const listResponse = await n8nClient.get('/admin/conversations');
      const listData = listResponse.data;
      const convList = Array.isArray(listData) ? listData : (listData.conversations || []);
      convData = convList.find((c: any) => c.id === id);
    } catch { /* ignore — ใช้ fallback */ }

    // สร้าง Conversation object สมบูรณ์
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

  /** N8N workflow: UPDATE conversation status — ใช้ local state เป็นหลัก */
  updateStatus: async (id: string, status: 'open' | 'pending' | 'resolved' | 'archived'): Promise<Conversation> => {
    if (MOCK_MODE) {
      await delay(300);
      return { id, status } as any;
    }

    // resolved/open/pending — ยังไม่มี endpoint, return local update
    return { id, status } as any;
  },

  /** N8N workflow: upsert LINE tags per user */
  updateTags: async (
    id: string,
    labels: Array<{ id: string; name: string; color: string }>
  ): Promise<Array<{ id: string; name: string; color: string }>> => {
    if (MOCK_MODE) {
      await delay(250);
      return labels;
    }

    const response = await n8nClient.post('/admin/conversations/tags', {
      conversationId: id,
      tags: labels.map((label) => ({ name: label.name, color: label.color })),
    });

    const data = response.data;
    return Array.isArray(data?.labels) ? data.labels : labels;
  },

  markAsRead: async (id: string): Promise<void> => {
    // ยังไม่มี endpoint ใน N8N — no-op
    if (MOCK_MODE) { await delay(100); }
  },

  /** N8N workflow: COUNT queries on chat_memory + admin_takeover */
  getStats: async (): Promise<Stats> => {
    if (MOCK_MODE) { await delay(300); return mockStats; }

    // N8N webhook: GET /admin/dashboard/stats
    const response = await n8nClient.get('/admin/dashboard/stats');
    return response.data;
  },
};

// ─────────────────────────────────────────────────────────────
// Messages APIs  →  N8N: POST /admin/messages/send
// ─────────────────────────────────────────────────────────────
export const messagesAPI = {
  /** N8N workflow: SELECT * FROM chat_memory WHERE user_id = :id ORDER BY created_at */
  getByConversation: async (conversationId: string): Promise<Message[]> => {
    if (MOCK_MODE) {
      await delay(200);
      return getMockConversationById(conversationId)?.messages || [];
    }

    // N8N webhook: POST /admin/messages/get { conversationId }
    const response = await n8nClient.post('/admin/messages/get', { conversationId });
    // N8N returns { messages: [...], total: N } — extract array
    const data = response.data;
    return Array.isArray(data) ? data : (data.messages || []);
  },

  /**
   * N8N workflow: รับข้อความจาก admin → INSERT chat_memory (role=admin) →
   * POST LINE Push Message API → return message object
   */
  send: async (conversationId: string, content: string, type: 'admin' = 'admin'): Promise<Message> => {
    if (MOCK_MODE) {
      await delay(400);
      return generateMockMessage(conversationId, content, type);
    }

    // N8N webhook: POST /admin/messages/send { conversationId, content, type }
    const response = await n8nClient.post('/admin/messages/send', {
      conversationId,
      content,
      type,
    });
    return response.data;
  },

};

// ─────────────────────────────────────────────────────────────
// Dashboard APIs  →  N8N: GET /admin/dashboard/stats
// ─────────────────────────────────────────────────────────────
export const dashboardAPI = {
  /** N8N workflow: aggregate queries จาก Postgres */
  getStats: async (): Promise<Stats> => {
    if (MOCK_MODE) { await delay(300); return mockStats; }

    // N8N webhook: GET /admin/dashboard/stats
    const response = await n8nClient.get('/admin/dashboard/stats');
    return response.data;
  },

  /** N8N workflow: SELECT latest conversations + unread counts */
  getRecentConversations: async (limit = 10): Promise<Conversation[]> => {
    if (MOCK_MODE) {
      await delay(300);
      return generateMockConversations().slice(0, limit);
    }

    // N8N webhook: GET /admin/conversations?limit=10&sort=recent
    const response = await n8nClient.get('/admin/conversations', {
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
// Tags APIs  →  N8N: GET/POST/DELETE /admin/tags
// ─────────────────────────────────────────────────────────────
export const tagsAPI = {
  getAll: async (): Promise<Tag[]> => {
    if (MOCK_MODE) { await delay(200); return []; }
    const response = await n8nClient.get('/admin/tags');
    const data = response.data;
    return Array.isArray(data) ? data : (data.tags || data || []);
  },

  create: async (name: string, color: string, scope: string = 'global'): Promise<Tag> => {
    if (MOCK_MODE) { await delay(200); return { id: Date.now().toString(), name, color, scope }; }
    const response = await n8nClient.post('/admin/tags', { name, color, scope });
    return response.data;
  },

  delete: async (tagId: string): Promise<void> => {
    if (MOCK_MODE) { await delay(200); return; }
    await n8nClient.post('/admin/tags/delete', { tagId });
  },
};

export default apiClient;
