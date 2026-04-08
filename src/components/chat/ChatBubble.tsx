'use client';

import { Message } from '@/types';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale/th';
import { Bot, UserCheck } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  customerName?: string;
  customerAvatar?: string;
}

export function ChatBubble({ message, customerName, customerAvatar }: ChatBubbleProps) {
  const isUser = message.senderType === 'customer';
  const isBot = message.senderType === 'bot';
  const isAdmin = message.senderType === 'admin';

  // ลูกค้า (user) อยู่ฝั่งซ้าย — bot/admin อยู่ฝั่งขวา
  const isRight = isBot || isAdmin;
  const isLeft = isUser;

  // ชื่อที่แสดง: user → ใช้ customerName (LINE displayName), bot/admin → ใช้ sender.name
  const displayName = isUser
    ? (customerName || message.sender.name)
    : message.sender.name;

  return (
    <div
      className={cn('flex gap-2 max-w-[85%]', {
        'ml-auto flex-row-reverse': isRight,
        'mr-auto': isLeft,
      })}
    >
      {/* Avatar */}
      {isLeft && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-5 text-xs font-semibold text-gray-600 overflow-hidden">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName || ''} className="w-full h-full object-cover" />
          ) : (
            (customerName || message.sender.name).charAt(0)
          )}
        </div>
      )}
      {isRight && (
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-5',
          isBot ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
        )}>
          {isBot ? <Bot className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
        </div>
      )}

      <div className={cn('flex flex-col gap-0.5', {
        'items-end': isRight,
        'items-start': isLeft,
      })}>
        <span className={cn(
          'text-[11px] font-medium px-1',
          isUser ? 'text-gray-500' : isBot ? 'text-blue-600' : 'text-orange-600'
        )}>
          {displayName}
        </span>

        <div
          className={cn(
            'px-3.5 py-2 rounded-2xl break-words whitespace-pre-wrap text-sm leading-relaxed shadow-sm',
            isRight
              ? 'bg-primary text-white rounded-br-md'
              : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
          )}
        >
          {message.content}
        </div>

        <span className="text-[10px] text-muted-foreground px-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true, locale: th })}
        </span>
      </div>
    </div>
  );
}
