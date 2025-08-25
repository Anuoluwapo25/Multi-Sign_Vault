'use client';

import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const { wallets } = getDefaultWallets({
  appName: 'Micro-NGN Marketplace',
  projectId: 'demo-project-id', // Replace with your actual WalletConnect project ID
});

const connectors = connectorsForWallets(wallets, {
  appName: 'Micro-NGN Marketplace',
  projectId: 'demo-project-id',
});

const config = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 