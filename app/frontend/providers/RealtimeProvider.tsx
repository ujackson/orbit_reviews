import { createContext, useContext, ReactNode, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createConsumer, type Consumer, type Subscription } from '@rails/actioncable';
import { env } from '../bootstrap/env';
import { useWorkspace } from './WorkspaceProvider';

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
  const consumerRef = useRef<Consumer | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (!workspace?.id) {
      setIsConnected(false);
      return;
    }

    const consumer = createConsumer(env.wsUrl);
    consumerRef.current = consumer;
    subscriptionRef.current = consumer.subscriptions.create(
      { channel: 'AiUpdatesChannel', workspace_id: workspace.id },
      {
        connected: () => {
          setIsConnected(true);
          console.log('[Realtime] Connected');
        },
        disconnected: () => {
          setIsConnected(false);
          console.log('[Realtime] Disconnected');
        },
        received: (event: unknown) => handleRealtimeEvent(event as RealtimeEvent),
      }
    );

    return () => {
      setIsConnected(false);
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      consumer.disconnect();
      consumerRef.current = null;
    };
  }, [workspace?.id]);

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
      case 'ai.analysis.completed':
        // Invalidate AI summary queries
        queryClient.invalidateQueries({ queryKey: ['ai'] });
        break;

      default:
        console.warn('[Realtime] Unknown event type:', event.type);
    }
  };

  const send = (event: RealtimeEvent) => {
    subscriptionRef.current?.perform('receive', event);
  };

  const value: RealtimeContextType = {
    isConnected,
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
