// lib/walletNaming.ts
class WalletNamingService {
  private STORAGE_KEY = 'securevault_wallet_names';

  // Get wallet name from localStorage
  getWalletName(address: string): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const names = JSON.parse(stored);
        return names[address.toLowerCase()] || null;
      }
    } catch (error) {
      console.error('Error reading wallet names:', error);
    }
    return null;
  }

  // Set wallet name in localStorage
  setWalletName(address: string, name: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const names = stored ? JSON.parse(stored) : {};
      names[address.toLowerCase()] = name;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.error('Error saving wallet name:', error);
    }
  }

  // Generate default name
  generateDefaultName(index: number): string {
    const defaultNames = [
      'Main Treasury',
      'Payroll Wallet', 
      'Operations Fund',
      'Emergency Reserve',
      'Project Wallet'
    ];
    
    if (index < defaultNames.length) {
      return defaultNames[index];
    }
    
    return `Treasury ${index + 1}`;
  }

  // Remove wallet name
  removeWalletName(address: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const names = JSON.parse(stored);
        delete names[address.toLowerCase()];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(names));
      }
    } catch (error) {
      console.error('Error removing wallet name:', error);
    }
  }
}

export const walletNamingService = new WalletNamingService();