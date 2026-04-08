export type UserRole = 'admin' | 'staff';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'archived';

export type MessageSenderType = 'customer' | 'admin' | 'bot' | 'system';

/** @deprecated use MessageSenderType */
export type MessageType = MessageSenderType;

export type MessageContentType = 'text' | 'image' | 'file' | 'sticker' | 'template' | 'carousel' | 'location' | 'event';

export type Channel = 'line' | 'facebook' | 'instagram' | 'webchat' | 'tiktok' | 'other';

export type ReadStatus = 'read' | 'unread' | 'all';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  scope?: 'global' | 'customer' | 'conversation';
}

/** @deprecated use Tag */
export type CustomerLabel = Tag;

export interface CustomerNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CustomerInfo {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  email?: string;
  phone?: string;
  channel: Channel;
  labels: Tag[];
  notes: CustomerNote[];
  status?: string;
  address?: string;
  context?: string[];
  joinedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  type: MessageSenderType;
  direction: 'inbound' | 'outbound';
  messageType: MessageContentType;
  contentText?: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: MessageSenderType;
    avatar?: string;
  };
  timestamp: string;
  isRead: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
}

export interface Conversation {
  id: string;
  customerUserId: string;
  customerExternalId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAvatar?: string;
  channel: Channel;
  status: ConversationStatus;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: Message[];
  labels: Tag[];
  customerInfo?: CustomerInfo;
  createdAt: string;
  updatedAt: string;
  summary?: string;
}

export interface QuickMessage {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface Stats {
  totalConversations: number;
  botHandled: number;
  humanRequired: number;
  resolved: number;
  channelStats?: {
    line: number;
    facebook: number;
    instagram: number;
    tiktok: number;
  };
  todayMessages?: number;
  responseRate?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
