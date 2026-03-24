import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import App from './App';
import { inkSepolia } from './config/chains';

const config = getDefaultConfig({
  appName: '2048 on Ink',
  // Use a real WalletConnect Project ID from https://cloud.walletconnect.com
  // for production. The placeholder below works for local dev.
  projectId: 'a79fc748eb25885ec7c337cd69d25296',
  chains: [inkSepolia],
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#6e51ff',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
