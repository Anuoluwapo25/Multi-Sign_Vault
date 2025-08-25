// Stacks Configuration
// Configuration for Stacks blockchain integration

export const STACKS_CONFIG = {
  // Network Configuration
  NETWORK: process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet',
  
  // Contract Configuration (update after deployment)
  CONTRACTS: {
    MULTISIG: process.env.NEXT_PUBLIC_MULTISIG_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig',
    MULTISIG_FACTORY: process.env.NEXT_PUBLIC_MULTISIG_FACTORY_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig-factory',
    SIP010_TRAIT: process.env.NEXT_PUBLIC_SIP010_TRAIT_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait',
  },
  
  // Token Configuration
  TOKENS: {
    'STX': {
      symbol: 'STX',
      name: 'Stacks',
      decimals: 6,
      contractAddress: 'STX', // Native token
    },
    'USDA': {
      symbol: 'USDA',
      name: 'USDA Token',
      decimals: 6,
      contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
    },
    // Add cNGN when available on Stacks
    'cNGN': {
      symbol: 'cNGN',
      name: 'Central Bank Digital Currency - Naira',
      decimals: 6,
      contractAddress: process.env.NEXT_PUBLIC_CNGN_STACKS_CONTRACT || '',
    },
  },
  
  // API Configuration
  API: {
    TESTNET_URL: 'https://api.testnet.hiro.so',
    MAINNET_URL: 'https://api.hiro.so',
    SOCKET_URL: 'wss://api.testnet.hiro.so',
  },
  
  // App Configuration
  APP: {
    NAME: 'SecureVault',
    ICON: '/logo.png',
    DESCRIPTION: 'Multi-signature wallet for Stacks blockchain',
  },
  
  // Transaction Configuration
  TRANSACTION: {
    DEFAULT_FEE: 1000, // microSTX
    ANCHOR_MODE: 'any',
    POST_CONDITION_MODE: 'allow',
  },
  
  // Wallet Configuration
  WALLET: {
    MAX_SIGNERS: 20,
    MIN_THRESHOLD: 1,
    MAX_WALLETS_PER_ORG: 50,
  },
};

// Helper functions
export const getNetworkUrl = () => {
  return STACKS_CONFIG.NETWORK === 'mainnet' 
    ? STACKS_CONFIG.API.MAINNET_URL 
    : STACKS_CONFIG.API.TESTNET_URL;
};

export const getContractAddress = (contractName: keyof typeof STACKS_CONFIG.CONTRACTS) => {
  return STACKS_CONFIG.CONTRACTS[contractName];
};

export const getTokenConfig = (symbol: string) => {
  return STACKS_CONFIG.TOKENS[symbol as keyof typeof STACKS_CONFIG.TOKENS];
};

export const isMainnet = () => {
  return STACKS_CONFIG.NETWORK === 'mainnet';
};

export const isTestnet = () => {
  return STACKS_CONFIG.NETWORK === 'testnet';
};
