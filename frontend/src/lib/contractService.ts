// lib/contractService.ts
import { ethers } from 'ethers';
import { MultisigContract, MultisigFactoryContract } from '../app/index';

// ERC-20 ABI for token operations
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// cNGN Configuration - update with real address
const CNGN_CONFIG = {
  CONTRACT_ADDRESS: '0xa1F8BD1892C85746AE71B97C31B1965C4641f1F0', // Actual cNGN contract on Base Sepolia
  DECIMALS: 18,
  SYMBOL: 'cNGN',
  NAME: 'Nigerian Naira Token'
};

// Token addresses - simplified for now
export const TOKEN_ADDRESSES = {
  'cNGN': CNGN_CONFIG.CONTRACT_ADDRESS,
};

export interface WalletInfo {
  signers: string[];
  threshold: number;
  totalTransactions: number;
  pendingTransactions: number;
}

export interface TransactionInfo {
  id: number;
  to: string;
  value: string;
  data: string;
  executed: boolean;
  approvalCount: number;
  threshold: number;
  token?: string;
  tokenSymbol?: string;
  userHasApproved?: boolean; // Whether the current user has approved this transaction
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  address: string;
}

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        console.log('Provider initialized successfully');
      } catch (error) {
        console.error('Failed to initialize provider:', error);
      }
    }
  }

  async getProvider() {
    if (!this.provider) {
      await this.initializeProvider();
    }
    return this.provider;
  }

  // Factory contract methods
  async createWallet(signers: string[], threshold: number) {
    const provider = await this.getProvider();
    if (!provider || !this.signer) throw new Error('Provider not initialized');

    const factory = new ethers.Contract(
      MultisigFactoryContract.address,
      MultisigFactoryContract.abi,
      this.signer
    );

    const tx = await factory.createWallet(signers, threshold);
    return tx.hash;
  }

  async getOrgWallets(orgAddress: string): Promise<string[]> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    const factory = new ethers.Contract(
      MultisigFactoryContract.address,
      MultisigFactoryContract.abi,
      provider
    );

    try {
      const wallets = await factory.getOrgWallets(orgAddress);
      return wallets;
    } catch (error) {
      console.error('Error fetching org wallets:', error);
      return [];
    }
  }

  // Wallet contract methods
  async verifyWalletContract(walletAddress: string): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      if (!provider) return false;

      const code = await provider.getCode(walletAddress);
      return code !== '0x';
    } catch (error) {
      console.error('Error verifying wallet contract:', error);
      return false;
    }
  }

  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    const wallet = new ethers.Contract(
      walletAddress,
      MultisigContract.abi,
      provider
    );

    try {
      const [, threshold, totalTransactions, pendingTransactions] = 
        await wallet.getWalletStatus();
      
      const signers = await wallet.getSigners();

      return {
        signers: signers,
        threshold: Number(threshold),
        totalTransactions: Number(totalTransactions),
        pendingTransactions: Number(pendingTransactions)
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }

  async getWalletBalance(walletAddress: string): Promise<string> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      const balance = await provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }

  // Get token balance with simplified approach
  async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<string> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      console.log('Getting token balance for:', { walletAddress, tokenAddress });
      
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      const decimals = await tokenContract.decimals();
      
      console.log('Token balance raw:', balance.toString());
      console.log('Token decimals:', decimals);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('Formatted token balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  // Get all token balances
  async getAllTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    const balances: TokenBalance[] = [];

    for (const [symbol, address] of Object.entries(TOKEN_ADDRESSES)) {
      try {
        const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(walletAddress),
          tokenContract.decimals()
        ]);
        
        const formattedBalance = ethers.formatUnits(balance, decimals);

        balances.push({
          symbol,
          balance: formattedBalance,
          decimals: Number(decimals),
          address
        });
      } catch (error) {
        console.error(`Error getting ${symbol} balance:`, error);
        balances.push({
          symbol,
          balance: '0',
          decimals: 18,
          address
        });
      }
    }

    return balances;
  }

  // Check if a signer has approved a specific transaction
  async hasApprovedTransaction(walletAddress: string, transactionId: number, signerAddress: string): Promise<boolean> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      const wallet = new ethers.Contract(
        walletAddress,
        MultisigContract.abi,
        provider
      );

      const hasApproved = await wallet.hasApproved(transactionId, signerAddress);
      return hasApproved;
    } catch (error) {
      console.error('Error checking approval status:', error);
      return false;
    }
  }

  // Get transaction approval status for a specific signer
  async getTransactionApprovalStatus(walletAddress: string, transactionId: number, signerAddress: string): Promise<{
    hasApproved: boolean;
    approvalCount: number;
    threshold: number;
    executed: boolean;
  }> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      const wallet = new ethers.Contract(
        walletAddress,
        MultisigContract.abi,
        provider
      );

      const [hasApproved, [, threshold], [to, value, data, executed, approvalCount]] = await Promise.all([
        wallet.hasApproved(transactionId, signerAddress),
        wallet.getWalletStatus(),
        wallet.getTransaction(transactionId)
      ]);

      return {
        hasApproved,
        approvalCount: Number(approvalCount),
        threshold: Number(threshold),
        executed
      };
    } catch (error) {
      console.error('Error getting transaction approval status:', error);
      return {
        hasApproved: false,
        approvalCount: 0,
        threshold: 0,
        executed: false
      };
    }
  }

  async getAllTransactions(walletAddress: string): Promise<TransactionInfo[]> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    const wallet = new ethers.Contract(
      walletAddress,
      MultisigContract.abi,
      provider
    );

    try {
      const [, , totalTransactions] = await wallet.getWalletStatus();
      const transactions: TransactionInfo[] = [];

      for (let i = 0; i < Number(totalTransactions); i++) {
        try {
          const [to, value, data, executed, approvalCount] = await wallet.getTransaction(i);
          const [, threshold] = await wallet.getWalletStatus();

          // Try to decode token transfer data
          const tokenInfo = await this.decodeTokenTransfer(data, to);

          transactions.push({
            id: i,
            to,
            value: value.toString(),
            data,
            executed,
            approvalCount: Number(approvalCount),
            threshold: Number(threshold),
            token: tokenInfo?.token,
            tokenSymbol: tokenInfo?.symbol
          });
        } catch (error) {
          console.error(`Error getting transaction ${i}:`, error);
        }
      }

      return transactions.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  private async decodeTokenTransfer(data: string, to: string): Promise<{token: string, symbol: string} | null> {
    try {
      if (data === '0x' || data.length < 10) return null;

      // Check if it's an ERC-20 transfer (function signature: 0xa9059cbb)
      const transferSelector = '0xa9059cbb';
      if (!data.startsWith(transferSelector)) return null;

      // Check if the 'to' address matches cNGN contract
      if (to.toLowerCase() === TOKEN_ADDRESSES.cNGN.toLowerCase()) {
        return {
          token: TOKEN_ADDRESSES.cNGN,
          symbol: 'cNGN'
        };
      }

      return null;
    } catch (error) {
      console.error('Error decoding token transfer:', error);
      return null;
    }
  }

  async encodeTokenTransfer(tokenAddress: string, to: string, amount: string): Promise<string> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const decimals = await tokenContract.decimals();
      const amountBN = ethers.parseUnits(amount, decimals);

      // Encode the transfer function call
      const iface = new ethers.Interface(ERC20_ABI);
      return iface.encodeFunctionData('transfer', [to, amountBN]);
    } catch (error) {
      console.error('Error encoding token transfer:', error);
      throw error;
    }
  }

  // Get token info
  async getTokenInfo(tokenAddress: string): Promise<{name: string, symbol: string, decimals: number}> {
    const provider = await this.getProvider();
    if (!provider) throw new Error('Provider not initialized');

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals()
      ]);

      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();