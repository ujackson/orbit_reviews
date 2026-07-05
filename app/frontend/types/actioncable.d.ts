declare module '@rails/actioncable' {
  export interface Subscription {
    unsubscribe(): void;
    perform(action: string, data?: unknown): void;
  }

  export interface Consumer {
    disconnect(): void;
    subscriptions: {
      create(
        channel: string | Record<string, unknown>,
        mixin: {
          connected?: () => void;
          disconnected?: () => void;
          received?: (data: unknown) => void;
        }
      ): Subscription;
    };
  }

  export function createConsumer(url?: string): Consumer;
}
