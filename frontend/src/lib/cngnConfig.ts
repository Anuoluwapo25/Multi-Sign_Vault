// lib/cngnConfig.ts

export const CNGN_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://api.cngn.co/v1/api',
  API_KEY: process.env.NEXT_PUBLIC_CNGN_API_KEY || '',
  
  // Contract Configuration
  CONTRACT_ADDRESS: '0x7E29CF1D8b1F4c847D0f821b79dDF6E67A5c11F8',
  
  // Network Configuration
  NETWORK: 'Base Sepolia Testnet',
  CHAIN_ID: 84532,
  
  // Token Configuration
  TOKEN_SYMBOL: 'cNGN',
  TOKEN_NAME: 'Central Bank Digital Currency - Naira',
  DECIMALS: 18,
  
  // API Endpoints
  ENDPOINTS: {
    BALANCE: '/balance',
    BANK_LIST: '/bank-list',
    TRANSACTION_HISTORY: '/transaction-history',
    VIRTUAL_ACCOUNT: '/virtual-account',
    REDEEM_ASSETS: '/redeem-assets',
    WITHDRAW_CNGN: '/withdraw-cngn',
    VERIFY_WITHDRAWAL: '/verify-withdrawal',
    BRIDGE_CNGN: '/bridge-cngn',
    WHITELIST_ADDRESS: '/whitelist-address'
  }
} as const;

export const isCNGNApiConfigured = (): boolean => {
  return !!CNGN_CONFIG.API_KEY;
}; 