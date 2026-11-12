import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.js';
import { ChatHeader } from '../components/chat/ChatHeader.js';
import { MessageItem } from '../components/chat/MessageItem.js';
import { WelcomeScreen } from '../components/chat/WelcomeScreen.js';
import { ChatInput } from '../components/chat/ChatInput.js';
import { useChat } from '../hooks/useChat.js';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
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
  } = useChat(conversationId);

  // Auto-scroll to bottom on new messages or streaming tokens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const activeConv = conversations.find((c) => c.id === currentConversationId);

  const handleSelectConversation = (id: string) => {
    navigate(`/app/${id}`);
    loadConversation(id);
    setMobileDrawerOpen(false);
  };

  const handleNewChat = () => {
    startNewConversation();
    navigate('/app');
    setMobileDrawerOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-text-primary">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar
          conversations={conversations}
          currentId={currentConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={deleteConversation}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sidebar
        conversations={conversations}
        currentId={currentConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        isOpen={mobileDrawerOpen}
        onToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        isMobileDrawer={true}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden relative min-w-0">
        {/* Chat Header */}
        <ChatHeader
          title={activeConv?.title}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) {
              setMobileDrawerOpen(true);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          onNewChat={handleNewChat}
        />

        {/* Message View Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-text-secondary text-xs">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Loading research session...</span>
              </div>
            ) : messages.length === 0 && !isStreaming ? (
              <WelcomeScreen onSelectPrompt={(prompt) => sendMessage(prompt)} />
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <MessageItem
                    key={msg.id || index}
                    message={msg}
                    isLatestAssistant={
                      index === messages.length - 1 && msg.role === 'assistant'
                    }
                    onRetry={retryLastMessage}
                  />
                ))}

                {/* Streaming Assistant Turn */}
                {isStreaming && (
                  <MessageItem
                    message={{
                      id: 'streaming-temp',
                      conversationId: currentConversationId || 'temp',
                      role: 'assistant',
                      content: streamingContent || 'Investigating persistent memory and live web search...',
                      createdAt: new Date().toISOString(),
                      sources: streamingSources,
                    }}
                    isStreaming={true}
                  />
                )}
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="my-4 p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-xs text-status-error flex items-center justify-between animate-in fade-in">
                <span>{error}</span>
                <button
                  onClick={retryLastMessage}
                  className="underline font-semibold hover:opacity-80 ml-3"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Composer Tray */}
        <ChatInput
          onSendMessage={sendMessage}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </main>
    </div>
  );
};
