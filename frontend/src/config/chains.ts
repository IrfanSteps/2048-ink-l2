import { defineChain } from 'viem';

export const inkMainnet = defineChain({
  id: 57073,
  name: 'Ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-qnd.inkonchain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer.inkonchain.com',
    },
  },
});

export const inkSepolia = defineChain({
  id: 763373,
  name: 'Ink Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-gel-sepolia-ingress.inkonchain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Ink Explorer',
      url: 'https://explorer-sepolia.inkonchain.com',
    },
  },
  testnet: true,
});
