// lib/cngnApiService.ts
import { CNGN_CONFIG } from './cngnConfig';

interface CNGNBalanceResponse {
  status: number;
  message: string;
  data: CNGNBalanceData[];
}

interface CNGNBalanceData {
  asset_type: string;
  asset_code: string;
  balance: string;
}

class CNGNApiService {
  /**
   * Get cNGN balance for a wallet address using the official cNGN API
   * @param walletAddress - The wallet address to get balance for
   * @returns Promise<string> - The balance as a string
   */
  async getCNGNBalance(walletAddress: string): Promise<string> {
    try {
      if (!CNGN_CONFIG.API_KEY) {
        console.warn('cNGN API key not configured, falling back to contract balance');
        return '0';
      }

      // Note: The cNGN API currently doesn't support wallet-specific balance queries
      // This is a placeholder for future implementation
      console.log(`Requesting cNGN balance for wallet: ${walletAddress}`);

      const response = await fetch(`${CNGN_CONFIG.API_BASE_URL}${CNGN_CONFIG.ENDPOINTS.BALANCE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CNGN_CONFIG.API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`cNGN API error: ${response.status} ${response.statusText}`);
      }

      const data: CNGNBalanceResponse = await response.json();
      
      if (data.status !== 200) {
        throw new Error(`cNGN API error: ${data.message}`);
      }

      // Find the cNGN balance in the response
      const cngnBalance = data.data.find(balance => balance.asset_code === 'CNGN');
      
      if (!cngnBalance) {
        console.warn('No cNGN balance found in API response');
        return '0';
      }

      return cngnBalance.balance;
    } catch (error) {
      console.error('Error fetching cNGN balance from API:', error);
      // Fallback to contract balance if API fails
      return '0';
    }
  }

  /**
   * Get cNGN balance with fallback to contract balance
   * @param walletAddress - The wallet address to get balance for
   * @param contractService - The contract service for fallback
   * @returns Promise<string> - The balance as a string
   */
  async getCNGNBalanceWithFallback(walletAddress: string, contractService: { getTokenBalance: (address: string, tokenAddress: string) => Promise<string> }): Promise<string> {
    try {
      // First try to get balance from cNGN API
      const apiBalance = await this.getCNGNBalance(walletAddress);
      
      if (apiBalance !== '0' && parseFloat(apiBalance) > 0) {
        return apiBalance;
      }

      // Fallback to contract balance if API returns 0 or fails
      const contractBalance = await contractService.getTokenBalance(
        walletAddress, 
        CNGN_CONFIG.CONTRACT_ADDRESS
      );

      return contractBalance;
    } catch (error) {
      console.error('Error getting cNGN balance with fallback:', error);
      return '0';
    }
  }

  /**
   * Check if cNGN API is configured and available
   * @returns boolean - True if API is configured
   */
  isApiConfigured(): boolean {
    return !!CNGN_CONFIG.API_KEY;
  }

  /**
   * Test the cNGN API connection
   * @returns Promise<boolean> - True if API is working
   */
  async testApiConnection(): Promise<boolean> {
    try {
      if (!CNGN_CONFIG.API_KEY) {
        return false;
      }

      const response = await fetch(`${CNGN_CONFIG.API_BASE_URL}${CNGN_CONFIG.ENDPOINTS.BALANCE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CNGN_CONFIG.API_KEY}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing cNGN API connection:', error);
      return false;
    }
  }
}

export const cngnApiService = new CNGNApiService(); 