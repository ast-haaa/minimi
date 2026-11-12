import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { ChatArea } from './components/ChatArea.js';
import { useChat } from './hooks/useChat.js';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    conversations,
    currentConversationId,
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    error,
    sendMessage,
    loadConversation,
    startNewConversation,
    deleteConversation,
    stopStreaming,
    retryLastMessage,
  } = useChat();

  const currentConv = conversations.find((c) => c.id === currentConversationId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ivory font-sans text-text-primary">
      <Sidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={loadConversation}
        onNew={startNewConversation}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <ChatArea
        messages={messages}
        conversationTitle={currentConv?.title}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        streamingSources={streamingSources}
        error={error}
        onSendMessage={sendMessage}
        onStop={stopStreaming}
        onRetry={retryLastMessage}
      />
    </div>
  );
};
