'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '../wagmi/config'; // Your wagmi config
import { ReactNode } from 'react';

export default function Web3Provider({ children }: { children: ReactNode }) {
 
  return (
    <WagmiProvider config={config}>
      
        {children}
      
    </WagmiProvider>
  );
}
