import { Conversation, Message, Stats, QuickMessage, CustomerLabel } from '@/types';

// Labels (ตั้งค่าจริง — ไม่ใช่ Mock)
export const mockLabels: CustomerLabel[] = [
  { id: 'label1', name: 'VIP', color: '#f36734' },
  { id: 'label2', name: 'สนใจจอง', color: '#3b82f6' },
  { id: 'label3', name: 'รอชำระเงิน', color: '#f59e0b' },
  { id: 'label4', name: 'จองแล้ว', color: '#22c55e' },
  { id: 'label5', name: 'ยกเลิก', color: '#ef4444' },
  { id: 'label6', name: 'ลูกค้าเก่า', color: '#8b5cf6' },
];

// Quick Messages (ตั้งค่าจริง — แก้ไขเนื้อหาให้ตรงกับ BaanPool)
export const mockQuickMessages: QuickMessage[] = [
  { id: 'qm1', title: 'ต้อนรับ', content: 'สวัสดีค่ะ ยินดีต้อนรับสู่ BaanPool 🏖️ มีอะไรให้ช่วยเหลือคะ?', category: 'ทั่วไป' },
  { id: 'qm2', title: 'วิธีจอง', content: 'สามารถแจ้งวันที่ต้องการและจำนวนคนมาได้เลยค่ะ แอดมินจะตรวจสอบวันว่างให้ค่ะ', category: 'การจอง' },
  { id: 'qm3', title: 'ขอบคุณ', content: 'ขอบคุณที่สนใจค่ะ หากมีข้อสงสัยสอบถามได้ตลอดนะคะ 😊', category: 'ทั่วไป' },
  { id: 'qm4', title: 'แจ้งชำระ', content: 'ได้รับข้อมูลแล้วค่ะ รบกวนโอนเงินมัดจำมาก่อนนะคะ แล้วส่งสลิปมาในแชทนี้ได้เลยค่ะ', category: 'การชำระเงิน' },
  { id: 'qm5', title: 'Check-in', content: 'เช็คอินเวลา 14:00 น. เช็คเอาท์ 12:00 น. ค่ะ หากต้องการ Early Check-in สามารถแจ้งล่วงหน้าได้ค่ะ', category: 'ข้อมูล' },
  { id: 'qm6', title: 'ติดต่อแอดมิน', content: 'ขออนุญาตให้แอดมินดูแลต่อนะคะ รอสักครู่ค่ะ 🙏', category: 'ทั่วไป' },
];

// ---- ข้อมูลด้านล่างจะถูกโหลดจาก N8N จริง ----

// Conversations จะมาจาก GET /webhook/conversations (N8N)
export const mockConversations: Conversation[] = [];

// Stats จะมาจาก GET /webhook/dashboard/stats (N8N)
export const mockStats: Stats = {
  totalConversations: 0,
  botHandled: 0,
  humanRequired: 0,
  resolved: 0,
  channelStats: { line: 0, facebook: 0, instagram: 0, tiktok: 0 },
  todayMessages: 0,
  responseRate: 0,
};

// ---- Helper Functions ----

export function generateMockConversations(): Conversation[] {
  return mockConversations;
}

export function getMockConversationById(id: string): Conversation | undefined {
  return mockConversations.find((c) => c.id === id);
}

export function filterConversations(
  conversations: Conversation[],
  status?: string,
  search?: string,
  channel?: string,
  readStatus?: string
): Conversation[] {
  let filtered = conversations;

  if (status && status !== 'all') {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (channel && channel !== 'all') {
    filtered = filtered.filter((c) => c.channel === channel);
  }
  if (readStatus === 'read') {
    filtered = filtered.filter((c) => c.unreadCount === 0);
  } else if (readStatus === 'unread') {
    filtered = filtered.filter((c) => c.unreadCount > 0);
  }
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.customerName.toLowerCase().includes(query) ||
        c.customerEmail?.toLowerCase().includes(query) ||
        c.labels.some((l) => l.name.toLowerCase().includes(query))
    );
  }

  return filtered;
}

export function generateMockMessage(
  conversationId: string,
  content: string,
  type: 'admin' = 'admin'
): Message {
  return {
    id: 'msg_' + Date.now(),
    conversationId,
    senderType: type as any,
    type: type as any,
    direction: 'outbound' as const,
    messageType: 'text' as const,
    contentText: content,
    content,
    sender: {
      id: type === 'admin' ? 'admin' : 'user1',
      name: type === 'admin' ? 'Admin' : 'Customer',
      type: type as any,
    },
    timestamp: new Date().toISOString(),
    isRead: true,
  };
}

export function getQuickMessages(): QuickMessage[] {
  return mockQuickMessages;
}
