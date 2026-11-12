import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConversationListItem, Message, Source } from '../../shared/types.js';
import * as api from '../lib/api.js';

export function useChat(initialId?: string) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [streamingSources, setStreamingSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const list = await api.fetchConversations();
      setConversations(list);
    } catch (e: unknown) {
      console.error('Failed to load conversations', e);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load selected conversation messages
  const loadConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchConversation(id);
      setCurrentConversationId(id);
      setMessages(data.messages);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load conversation';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Synchronize initialId if changed externally (e.g. route change)
  useEffect(() => {
    if (initialId && initialId !== currentConversationId) {
      loadConversation(initialId);
    }
  }, [initialId, currentConversationId, loadConversation]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
    }
    setCurrentConversationId(null);
    setMessages([]);
    setStreamingContent('');
    setStreamingSources([]);
    setError(null);
  }, [isStreaming]);

  // Stop active streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // If we had streaming content, preserve it as a message
    if (streamingContent.trim() && currentConversationId) {
      const partialMsg: Message = {
        id: `partial-${Date.now()}`,
        conversationId: currentConversationId,
        role: 'assistant',
        content: streamingContent + ' *(stopped by user)*',
        createdAt: new Date().toISOString(),
        sources: streamingSources,
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setStreamingContent('');
    setStreamingSources([]);
  }, [streamingContent, streamingSources, currentConversationId]);

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversationId: currentConversationId || 'pending',
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent('');
      setStreamingSources([]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await api.streamChatMessage({
        conversationId: currentConversationId || undefined,
        message: text.trim(),
        signal: controller.signal,
        onStart: (convId) => {
          if (!currentConversationId) {
            setCurrentConversationId(convId);
            window.history.replaceState(null, '', `/app/${convId}`);
          }
        },
        onToken: (token) => {
          setStreamingContent((prev) => prev + token);
        },
        onComplete: (content, sources) => {
          setIsStreaming(false);
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            conversationId: currentConversationId || 'done',
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
            sources,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent('');
          setStreamingSources([]);
          loadConversations();
        },
        onError: (err) => {
          setIsStreaming(false);
          setError(err.message);
          setStreamingContent('');
        },
      });
    },
    [currentConversationId, isStreaming, loadConversations]
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await api.deleteConversation(id);
        if (currentConversationId === id) {
          startNewConversation();
          window.history.replaceState(null, '', '/app');
        }
        await loadConversations();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to delete conversation';
        setError(msg);
      }
    },
    [currentConversationId, startNewConversation, loadConversations]
  );

  // Pin/unpin conversation
  const togglePin = useCallback(
    async (id: string, isPinned?: boolean) => {
      try {
        await api.togglePinConversation(id, isPinned);
        await loadConversations();
      } catch (e: unknown) {
        console.error('Failed to toggle pin', e);
      }
    },
    [loadConversations]
  );

  // Rename conversation
  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      try {
        await api.updateConversation(id, { title: newTitle.trim() });
        await loadConversations();
      } catch (e: unknown) {
        console.error('Failed to rename conversation', e);
      }
    },
    [loadConversations]
  );

  // Retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  return {
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
    togglePin,
    renameConversation,
    stopStreaming,
    retryLastMessage,
  };
}
