// Stacks Contract Service
// Replaces ethers.js with Stacks.js for Bitcoin smart contracts

import {
  AppConfig,
  UserSession,
  showConnect,
  openContractCall,
  StacksNetwork,
  StacksTestnet,
  StacksMainnet,
} from '@stacks/connect';
import {
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
  listCV,
  someCV,
  noneCV,
  bufferCV,
  contractPrincipalCV,
  callReadOnlyFunction,
  cvToJSON,
  hexToCV,
} from '@stacks/transactions';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';

// Configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network configuration
const NETWORK = process.env.NODE_ENV === 'production' 
  ? new StacksMainnet() 
  : new StacksTestnet();

// Contract addresses (update these after deployment)
export const CONTRACTS = {
  MULTISIG: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig',
  MULTISIG_FACTORY: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig-factory',
  SIP010_TRAIT: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait',
};

// Token addresses for Stacks ecosystem
export const STACKS_TOKEN_ADDRESSES = {
  'STX': 'STX', // Native STX token
  'USDA': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token', // Example SIP-010 token
  // Add cNGN when available on Stacks
};

export interface StacksWalletInfo {
  signers: string[];
  threshold: number;
  totalTransactions: number;
  pendingTransactions: number;
}

export interface StacksTransactionInfo {
  id: number;
  to: string;
  amount: string;
  tokenContract?: string;
  memo?: string;
  executed: boolean;
  approvalCount: number;
  threshold: number;
  proposer: string;
  blockHeight: number;
  userHasApproved?: boolean;
}

export interface StacksTokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  contractAddress: string;
}

export class StacksContractService {
  private network: StacksNetwork;
  private apiClient: StacksApiSocketClient;

  constructor() {
    this.network = NETWORK;
    this.apiClient = new StacksApiSocketClient();
  }

  // Connect wallet
  async connectWallet(): Promise<boolean> {
    return new Promise((resolve) => {
      showConnect({
        appDetails: {
          name: 'SecureVault',
          icon: '/logo.png',
        },
        redirectTo: '/',
        onFinish: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
        userSession,
      });
    });
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return userSession.isUserSignedIn();
  }

  // Get current user address
  getCurrentUserAddress(): string | null {
    if (!userSession.isUserSignedIn()) return null;
    return userSession.loadUserData().profile.stxAddress.testnet;
  }

  // Disconnect wallet
  disconnectWallet(): void {
    userSession.signUserOut('/');
  }

  // Create a new multisig wallet
  async createWallet(signers: string[], threshold: number): Promise<string> {
    const functionArgs = [
      listCV(signers.map(signer => standardPrincipalCV(signer))),
      uintCV(threshold),
    ];

    return new Promise((resolve, reject) => {
      openContractCall({
        network: this.network,
        anchorMode: AnchorMode.Any,
        contractAddress: CONTRACTS.MULTISIG_FACTORY.split('.')[0],
        contractName: CONTRACTS.MULTISIG_FACTORY.split('.')[1],
        functionName: 'create-wallet',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  }

  // Get wallet information
  async getWalletInfo(walletAddress: string): Promise<StacksWalletInfo> {
    try {
      const result = await callReadOnlyFunction({
        network: this.network,
        contractAddress: CONTRACTS.MULTISIG_FACTORY.split('.')[0],
        contractName: CONTRACTS.MULTISIG_FACTORY.split('.')[1],
        functionName: 'get-wallet-info',
        functionArgs: [standardPrincipalCV(walletAddress)],
        senderAddress: this.getCurrentUserAddress() || '',
      });

      const walletInfo = cvToJSON(result);
      
      if (walletInfo.success) {
        const data = walletInfo.success;
        return {
          signers: data.signers,
          threshold: data.threshold,
          totalTransactions: 0, // Will be fetched separately
          pendingTransactions: 0, // Will be fetched separately
        };
      }
      
      throw new Error('Wallet not found');
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }

  // Get wallet status from multisig contract
  async getWalletStatus(walletAddress: string): Promise<StacksWalletInfo> {
    try {
      const result = await callReadOnlyFunction({
        network: this.network,
        contractAddress: walletAddress.split('.')[0],
        contractName: 'multisig',
        functionName: 'get-wallet-status',
        functionArgs: [],
        senderAddress: this.getCurrentUserAddress() || '',
      });

      const status = cvToJSON(result);
      
      if (status.success) {
        return {
          signers: [], // Will be fetched separately
          threshold: status.success['current-threshold'],
          totalTransactions: status.success['total-transactions'],
          pendingTransactions: status.success['pending-transactions'],
        };
      }
      
      throw new Error('Failed to get wallet status');
    } catch (error) {
      console.error('Error getting wallet status:', error);
      throw error;
    }
  }

  // Get organization wallets
  async getOrgWallets(orgAddress: string): Promise<string[]> {
    try {
      const result = await callReadOnlyFunction({
        network: this.network,
        contractAddress: CONTRACTS.MULTISIG_FACTORY.split('.')[0],
        contractName: CONTRACTS.MULTISIG_FACTORY.split('.')[1],
        functionName: 'get-org-wallets',
        functionArgs: [standardPrincipalCV(orgAddress)],
        senderAddress: this.getCurrentUserAddress() || '',
      });

      const wallets = cvToJSON(result);
      return wallets.success || [];
    } catch (error) {
      console.error('Error getting org wallets:', error);
      return [];
    }
  }

  // Propose a transaction
  async proposeTransaction(
    walletAddress: string,
    to: string,
    amount: string,
    tokenContract?: string,
    memo?: string
  ): Promise<string> {
    const functionArgs = [
      standardPrincipalCV(to),
      uintCV(parseInt(amount)),
      tokenContract ? someCV(contractPrincipalCV(tokenContract)) : noneCV(),
      memo ? someCV(bufferCV(Buffer.from(memo, 'utf8'))) : noneCV(),
    ];

    return new Promise((resolve, reject) => {
      openContractCall({
        network: this.network,
        anchorMode: AnchorMode.Any,
        contractAddress: walletAddress.split('.')[0],
        contractName: 'multisig',
        functionName: 'propose-transaction',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  }

  // Approve a transaction
  async approveTransaction(walletAddress: string, txId: number): Promise<string> {
    const functionArgs = [uintCV(txId)];

    return new Promise((resolve, reject) => {
      openContractCall({
        network: this.network,
        anchorMode: AnchorMode.Any,
        contractAddress: walletAddress.split('.')[0],
        contractName: 'multisig',
        functionName: 'approve-transaction',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  }

  // Execute a transaction
  async executeTransaction(walletAddress: string, txId: number): Promise<string> {
    const functionArgs = [uintCV(txId)];

    return new Promise((resolve, reject) => {
      openContractCall({
        network: this.network,
        anchorMode: AnchorMode.Any,
        contractAddress: walletAddress.split('.')[0],
        contractName: 'multisig',
        functionName: 'execute-transaction',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled'));
        },
      });
    });
  }

  // Get STX balance
  async getSTXBalance(address: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.network.coreApiUrl}/extended/v1/address/${address}/balances`
      );
      const data = await response.json();
      return (parseInt(data.stx.balance) / 1000000).toString(); // Convert microSTX to STX
    } catch (error) {
      console.error('Error getting STX balance:', error);
      return '0';
    }
  }

  // Get token balances
  async getTokenBalances(address: string): Promise<StacksTokenBalance[]> {
    const balances: StacksTokenBalance[] = [];
    
    try {
      // Get STX balance
      const stxBalance = await this.getSTXBalance(address);
      balances.push({
        symbol: 'STX',
        balance: stxBalance,
        decimals: 6,
        contractAddress: 'STX',
      });

      // Get SIP-010 token balances
      for (const [symbol, contractAddress] of Object.entries(STACKS_TOKEN_ADDRESSES)) {
        if (symbol === 'STX') continue;
        
        try {
          const result = await callReadOnlyFunction({
            network: this.network,
            contractAddress: contractAddress.split('.')[0],
            contractName: contractAddress.split('.')[1],
            functionName: 'get-balance',
            functionArgs: [standardPrincipalCV(address)],
            senderAddress: address,
          });

          const balance = cvToJSON(result);
          if (balance.success) {
            balances.push({
              symbol,
              balance: balance.success.toString(),
              decimals: 6, // Default, should be fetched from contract
              contractAddress,
            });
          }
        } catch (error) {
          console.error(`Error getting ${symbol} balance:`, error);
        }
      }
    } catch (error) {
      console.error('Error getting token balances:', error);
    }

    return balances;
  }
}

export const stacksContractService = new StacksContractService();
