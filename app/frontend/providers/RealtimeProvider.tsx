import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '../bootstrap/env';

interface RealtimeEvent {
  type: string;
  payload: unknown;
}

interface RealtimeContextType {
  isConnected: boolean;
  send: (event: RealtimeEvent) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only connect when an explicit WS URL is configured (not the localhost fallback)
    if (!import.meta.env.VITE_WS_URL) return;

    if (env.isProduction) {
      const ws = new WebSocket(env.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Realtime] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch (error) {
          console.error('[Realtime] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[Realtime] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[Realtime] Disconnected');
      };

      return () => {
        ws.close();
      };
    }
  }, []);

  const handleRealtimeEvent = (event: RealtimeEvent) => {
    console.log('[Realtime] Event received:', event.type);

    switch (event.type) {
      case 'message.created':
        // Invalidate conversations list to show new message preview
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        // If the conversation is open, invalidate its messages
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        break;

      case 'conversation.updated':
        // Patch the specific conversation
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;

      case 'assignment.changed':
        // Invalidate conversations to update assignment
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;

      case 'ai.summary.updated':
        // Invalidate AI summary queries
        queryClient.invalidateQueries({ queryKey: ['aiSummary'] });
        break;

      default:
        console.warn('[Realtime] Unknown event type:', event.type);
    }
  };

  const send = (event: RealtimeEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  };

  const value: RealtimeContextType = {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    send,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
};
