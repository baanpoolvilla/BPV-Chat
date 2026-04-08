'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Conversation, Tag as TagType } from '@/types';
import { useChatStore } from '@/store/useChatStore';
import { messagesAPI, tagsAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChatBubble } from './ChatBubble';
import {
  Send,
  Loader,
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
  ChevronDown,
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
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const { sendMessage, setConversationLabels, updateConversationStatus, addMessageToConversation } = useChatStore();

  // Fetch available tags from DB
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagsAPI.getAll();
        setAvailableTags(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch tags:', e);
      }
    };
    fetchTags();
  }, []);

  // Close tag dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Realtime polling — fetch new messages every 5 seconds (silent, no flicker)
  const lastMessageCountRef = useRef(0);
  useEffect(() => {
    if (!conversation) return;
    lastMessageCountRef.current = conversation.messages?.length || 0;
  }, [conversation?.id]);

  // Messages มาพร้อม conversations แล้ว ไม่ต้อง fetch แยก
  // Scroll to bottom when conversation changes or messages update
  useEffect(() => {
    if (!conversation) return;
    scrollToBottom();
  }, [conversation?.id, conversation?.messages?.length]);

  // Polling — refresh conversations list every 5 seconds to get new messages
  useEffect(() => {
    if (!conversation) return;

    const pollConversations = async () => {
      try {
        // Conversation list already includes messages — just refresh to get updates
        const { refreshConversations } = useChatStore.getState();
        if (refreshConversations) {
          await refreshConversations();
        }
      } catch (error) {
        // Silently fail — will retry on next poll
      }
    };

    const interval = setInterval(pollConversations, 5000);
    return () => clearInterval(interval);
  }, [conversation?.id]);

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
    if (!nextName) return;
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

  const handleSelectTag = async (tag: TagType) => {
    if (!conversation) return;
    if (conversation.labels.some((l) => l.name.toLowerCase() === tag.name.toLowerCase())) {
      setShowTagDropdown(false);
      return;
    }
    const nextLabels = [...conversation.labels, { id: tag.id, name: tag.name, color: tag.color }];
    try {
      await setConversationLabels(conversation.id, nextLabels);
      setShowTagDropdown(false);
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
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0 overflow-hidden">
              {conversation.customerAvatar ? (
                <img src={conversation.customerAvatar} alt={conversation.customerName} className="w-full h-full object-cover" />
              ) : (
                (conversation.customerName || '?').charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{conversation.customerName}</h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
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
              <ChatBubble key={message.id} message={message} customerName={conversation.customerName} customerAvatar={conversation.customerAvatar} />
            ))
          )}
        </div>

        {/* Input Area */}
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
      </div>

      {/* Customer Details Panel (Right) */}
      {showCustomerPanel && (
        <div className="hidden lg:flex w-72 border-l border-border bg-white flex-col overflow-y-auto scrollbar-thin animate-slide-in-left">
          {/* Customer Header */}
          <div className="p-4 border-b border-border text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xl font-semibold text-gray-600 mx-auto mb-3 overflow-hidden">
              {conversation.customerAvatar ? (
                <img src={conversation.customerAvatar} alt={conversation.customerName} className="w-full h-full object-cover" />
              ) : (
                (conversation.customerName || '?').charAt(0)
              )}
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
            </div>
            {/* Tag selector dropdown */}
            <div className="relative mb-2" ref={tagDropdownRef}>
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="w-full flex items-center justify-between h-8 px-2.5 text-xs border border-border rounded-md bg-white hover:bg-muted/30 transition-colors"
              >
                <span className="text-muted-foreground">เลือกแท็ก...</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {showTagDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {availableTags.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">
                      ยังไม่มีแท็ก — ไปเพิ่มที่หน้า &quot;จัดการแท็ก&quot;
                    </div>
                  ) : (
                    availableTags
                      .filter((t) => !conversation.labels.some((l) => l.name.toLowerCase() === t.name.toLowerCase()))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleSelectTag(tag)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                          <span>{tag.name}</span>
                        </button>
                      ))
                  )}
                  {/* Custom tag input */}
                  <div className="border-t border-border flex gap-1 p-1.5">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                          setShowTagDropdown(false);
                        }
                      }}
                      placeholder="พิมพ์ชื่อแท็กใหม่..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2"
                      onClick={() => { handleAddTag(); setShowTagDropdown(false); }}
                    >
                      <PlusCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {conversation.labels.length === 0 ? (
                <p className="text-xs text-muted-foreground">ยังไม่มีป้ายกำกับ</p>
              ) : (
                conversation.labels.map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                    <button
                      type="button"
                      className="opacity-80 hover:opacity-100"
                      onClick={() => handleRemoveTag(label.id)}
                      aria-label={`remove-${label.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
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
