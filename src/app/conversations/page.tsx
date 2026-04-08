'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';

function ConversationsContent() {
  const { conversations, selectedConversationId } =
    useChatStore();

  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // When a conversation is selected on mobile, switch to chat view
  useEffect(() => {
    if (selectedConversationId) {
      setIsMobileListOpen(false);
    }
  }, [selectedConversationId]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile view */}
      <div className="md:hidden w-full h-full">
        {isMobileListOpen ? (
          <ConversationList />
        ) : (
          <ChatWindow
            conversation={selectedConversation || null}
            onBack={() => setIsMobileListOpen(true)}
          />
        )}
      </div>

      {/* Desktop view - 3-panel layout */}
      <div className="hidden md:flex w-full h-full">
        <ConversationList />
        <ChatWindow conversation={selectedConversation || null} />
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <ProtectedLayout hideHeader>
      <ConversationsContent />
    </ProtectedLayout>
  );
}
