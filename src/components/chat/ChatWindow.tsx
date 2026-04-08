'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Conversation } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { messagesAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatBubble } from './ChatBubble';
import {
  Send,
  Loader,
  CheckCircle2,
  MessageSquareText,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Tag,
  FileText,
  PlusCircle,
  Image,
  Paperclip,
  Receipt,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { mockQuickMessages } from '@/lib/mockData';

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack?: () => void;
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, setConversationLabels, updateConversationStatus, addMessageToConversation } = useChatStore();

  // Realtime polling — fetch new messages every 5 seconds (silent, no flicker)
  const lastMessageCountRef = useRef(0);
  useEffect(() => {
    if (!conversation) return;
    lastMessageCountRef.current = conversation.messages?.length || 0;
  }, [conversation?.id]);

  useEffect(() => {
    if (!conversation) return;
    const convId = conversation.id;

    const pollMessages = async () => {
      try {
        const messages = await messagesAPI.getByConversation(convId);
        const store = useChatStore.getState();
        const existingConv = store.conversations.find((c) => c.id === convId);
        if (!existingConv) return;

        // นับเฉพาะ real messages (ข้าม temp_)
        const realMessages = existingConv.messages.filter((m) => !m.id.startsWith('temp_'));
        const existingIds = new Set(realMessages.map((m) => m.id));
        const newMsgs = messages.filter((m) => !existingIds.has(m.id));

        if (newMsgs.length > 0) {
          newMsgs.forEach((msg) => addMessageToConversation(convId, msg));
          lastMessageCountRef.current = messages.length;
          scrollToBottom();
        }
      } catch (error) {
        // Silently fail — will retry on next poll
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [conversation?.id]); // Only depend on conversation ID, not message count

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 0);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f5f6fa]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-4">
            <MessageSquareText className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-1">
            เลือกบทสนทนา
          </h3>
          <p className="text-sm text-muted-foreground">
            เลือกบทสนทนาจากรายการด้านซ้ายเพื่อเริ่มต้น
          </p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    try {
      await sendMessage(conversation.id, inputValue);
      setInputValue('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      await updateConversationStatus(conversation.id, 'resolved');
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    }
  };

  const handleQuickMessage = (content: string) => {
    setInputValue(content);
    setShowQuickMessages(false);
  };

  const buildTagColor = (tagName: string) => {
    const palette = ['#2563eb', '#16a34a', '#d97706', '#db2777', '#0891b2', '#7c3aed'];
    const hash = Array.from(tagName).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  const handleAddTag = async () => {
    const nextName = tagInput.trim();
    if (!nextName || conversation.channel !== 'line') return;
    if (conversation.labels.some((label) => label.name.toLowerCase() === nextName.toLowerCase())) {
      setTagInput('');
      return;
    }

    const nextLabels = [
      ...conversation.labels,
      {
        id: `${conversation.id}:${nextName.toLowerCase()}`,
        name: nextName,
        color: buildTagColor(nextName),
      },
    ];

    try {
      await setConversationLabels(conversation.id, nextLabels);
      setTagInput('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const nextLabels = conversation.labels.filter((label) => label.id !== tagId);
    try {
      await setConversationLabels(conversation.id, nextLabels);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Chat Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <button onClick={onBack} className="md:hidden p-1 rounded hover:bg-muted">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
            )}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
              {conversation.customerName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{conversation.customerName}</h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                  conversation.status !== 'resolved' && 'bg-blue-100 text-blue-700',
                  conversation.status === 'resolved' && 'bg-green-100 text-green-700'
                )}>
                  {conversation.status === 'resolved' ? 'เสร็จสิ้น' : 'กำลังสนทนา'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {conversation.status !== 'resolved' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-green-300 text-green-600 hover:bg-green-50"
                  onClick={handleMarkResolved}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  เสร็จสิ้น
                </Button>
              </>
            )}

            {/* Toggle customer panel */}
            <button
              onClick={() => setShowCustomerPanel(!showCustomerPanel)}
              className={cn(
                'p-2 rounded-lg transition-colors hidden lg:flex',
                showCustomerPanel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5] scrollbar-thin"
        >
          {conversation.messages?.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              ยังไม่มีข้อความ
            </div>
          ) : (
            conversation.messages.map((message) => (
              <ChatBubble key={message.id} message={message} customerName={conversation.customerName} />
            ))
          )}
        </div>

        {/* Input Area */}
        {conversation.status !== 'resolved' && (
          <div className="border-t border-border bg-white p-3">
            {/* Quick messages panel */}
            {showQuickMessages && (
              <div className="mb-3 p-3 bg-muted/50 rounded-lg animate-slide-in max-h-48 overflow-y-auto">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  ข้อความด่วน
                </h4>
                <div className="space-y-1">
                  {mockQuickMessages.map((qm) => (
                    <button
                      key={qm.id}
                      onClick={() => handleQuickMessage(qm.content)}
                      className="w-full text-left px-3 py-2 rounded-md text-xs hover:bg-white transition-colors"
                    >
                      <span className="font-medium text-primary">{qm.title}</span>
                      <p className="text-muted-foreground truncate">{qm.content}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="แนบรูปภาพ">
                  <Image className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="แนบไฟล์">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    showQuickMessages ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                  )}
                  onClick={() => setShowQuickMessages(!showQuickMessages)}
                  title="ข้อความด่วน"
                >
                  <MessageSquareText className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="เปิดบิล">
                  <Receipt className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 relative">
                <Input
                  placeholder="พิมพ์ข้อความ..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className="pr-12 h-10 bg-muted/30 border-border"
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="h-10 px-4 btn-primary-gradient"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Panel (Right) */}
      {showCustomerPanel && (
        <div className="hidden lg:flex w-72 border-l border-border bg-white flex-col overflow-y-auto scrollbar-thin animate-slide-in-left">
          {/* Customer Header */}
          <div className="p-4 border-b border-border text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-semibold text-gray-600 mx-auto mb-3">
              {conversation.customerName.charAt(0)}
            </div>
            <h3 className="font-semibold text-sm">{conversation.customerName}</h3>
            <p className="text-xs text-muted-foreground">{conversation.customerEmail}</p>
          </div>

          {/* Customer Info */}
          <div className="p-4 border-b border-border space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ข้อมูลลูกค้า
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{conversation.customerPhone || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{conversation.customerEmail || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">-</span>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ป้ายกำกับ
              </h4>
              <span className="text-[10px] text-muted-foreground">LINE</span>
            </div>
            {conversation.channel === 'line' && (
              <div className="flex gap-1.5 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="เพิ่มแท็ก เช่น VIP"
                  className="h-8 text-xs"
                />
                <Button size="sm" variant="outline" className="h-8 px-2" onClick={handleAddTag}>
                  <PlusCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {conversation.labels.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {conversation.channel === 'line' ? 'ยังไม่มีป้ายกำกับ' : 'รองรับเฉพาะ LINE'}
                </p>
              ) : (
                conversation.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                    {conversation.channel === 'line' && (
                      <button
                        type="button"
                        className="opacity-80 hover:opacity-100"
                        onClick={() => handleRemoveTag(label.id)}
                        aria-label={`remove-${label.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Context */}
          <div className="p-4 border-b border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              บริบทสนทนา (Context)
            </h4>
            <div className="space-y-1">
              {conversation.status !== 'resolved' && (
                <div className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded">
                  open-conversation
                </div>
              )}
              {conversation.summary && (
                <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {conversation.summary}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                โน้ต
              </h4>
              <button className="text-primary hover:text-primary-hover">
                <PlusCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground italic">
              ยังไม่มีโน้ต
            </div>
          </div>

          {/* Open Bill Button */}
          <div className="p-4 border-t border-border mt-auto">
            <Button variant="outline" className="w-full gap-2 text-sm" size="sm">
              <Receipt className="h-4 w-4" />
              เปิดบิล
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
