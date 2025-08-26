'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useState } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const queryClient = new QueryClient();

// Create a context for Stacks authentication
const StacksContext = createContext<{
  userSession: UserSession;
  isSignedIn: boolean;
  connectWallet: () => void;
  disconnect: () => void;
} | null>(null);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function Providers({ children }: { children: React.ReactNode }) {
  const userSession = new UserSession({ appConfig });
  const [isSignedIn, setIsSignedIn] = useState(userSession.isUserSignedIn());

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Micro-NGN Marketplace',
        icon: '/favicon.ico', // Add your app icon path
      },
      redirectTo: '/',
      onFinish: () => {
        setIsSignedIn(true);
        window.location.reload();
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setIsSignedIn(false);
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <StacksContext.Provider 
        value={{ 
          userSession, 
          isSignedIn, 
          connectWallet, 
          disconnect 
        }}
      >
        {children}
      </StacksContext.Provider>
    </QueryClientProvider>
  );
}

// Custom hook to use Stacks context
export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a Providers component');
  }
  return context;
};