'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Users, 
  Shield, 
  Plus, 
  Settings, 
  Clock, 
  CheckCircle, 
  Building2,
  TrendingUp,
  Check,
  X,
  Copy,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Send,
  Globe,
  Edit3
} from 'lucide-react';
import { contractService, WalletInfo, TransactionInfo, TOKEN_ADDRESSES } from '../lib/contractService';
import { walletNamingService } from '../lib/walletNaming';
import { ethers } from 'ethers';
import TransactionProposer from './TransactionProposer';
import BulkPayment from './BulkPayment';
import SignerManager from './SignerManager';
import WalletCreator from './WalletCreator';
import WalletNameEditor from './WalletNameEditor';
import TransactionApprover from './TransactionApprover';
import TransactionExecutor from './TransactionExecutor';

interface WalletStats {
  totalSigners: number;
  activeSigners: number;
  threshold: number;
  pendingTransactions: number;
  totalTransactions: number;
  balance: string;
  cngnBalance: string; // Add cNGN token balance
}

export default function WalletDashboard({ pendingTreasuryName }: { pendingTreasuryName?: string }) {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalSigners: 0,
    activeSigners: 0,
    threshold: 0,
    pendingTransactions: 0,
    totalTransactions: 0,
    balance: '0',
    cngnBalance: '0'
  });
  
  const [userWallets, setUserWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [isLoadingWalletInfo, setIsLoadingWalletInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCurrentUserSigner, setIsCurrentUserSigner] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Modal state variables
  const [showTransactionProposer, setShowTransactionProposer] = useState(false);
  const [showSignerManager, setShowSignerManager] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showWalletCreator, setShowWalletCreator] = useState(false);
  const [showWalletNameEditor, setShowWalletNameEditor] = useState(false);
  const [showTransactionApprover, setShowTransactionApprover] = useState(false);
  const [showTransactionExecutor, setShowTransactionExecutor] = useState(false);
  const [editingWalletAddress, setEditingWalletAddress] = useState<string>('');
  const [editingWalletName, setEditingWalletName] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionInfo | null>(null);

  // Fix hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user's wallets
  useEffect(() => {
    if (address && mounted) {
      loadUserWallets();
    }
  }, [address, mounted]);

  // Load wallet info when selected
  useEffect(() => {
    if (selectedWallet && mounted) {
      loadWalletInfo();
      loadTransactions();
    }
  }, [selectedWallet, mounted]);

  const loadUserWallets = async () => {
    if (!address) return;
    
    setIsLoadingWallets(true);
    try {
      console.log('Loading wallets for address:', address);
      const wallets = await contractService.getOrgWallets(address);
      console.log('Found wallets:', wallets);
      setUserWallets(wallets);
      
      if (wallets.length > 0 && !selectedWallet) {
        setSelectedWallet(wallets[0]);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
      setWalletError('Failed to load wallets');
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const loadWalletInfo = async () => {
    if (!selectedWallet) return;
    
    setIsLoadingWalletInfo(true);
    setWalletError(null);
    
    try {
      const isValidContract = await contractService.verifyWalletContract(selectedWallet);
      if (!isValidContract) {
        setWalletError('Invalid wallet contract - no contract deployed at this address');
        throw new Error('Invalid wallet contract');
      }
      
      const [info, ethBalance, cngnBalance] = await Promise.all([
        contractService.getWalletInfo(selectedWallet),
        contractService.getWalletBalance(selectedWallet), // Native ETH balance
        contractService.getTokenBalance(selectedWallet, TOKEN_ADDRESSES.cNGN) // cNGN token balance
      ]);
      
      setWalletInfo(info);
      
      // Check if current user is a signer
      if (address) {
        const isSigner = info.signers.includes(address);
        setIsCurrentUserSigner(isSigner);
      }
      
      // Update stats
      const newStats = {
        totalSigners: info.signers.length,
        activeSigners: info.signers.length,
        threshold: info.threshold,
        pendingTransactions: info.pendingTransactions,
        totalTransactions: info.totalTransactions,
        balance: parseFloat(ethBalance).toFixed(4),
        cngnBalance: parseFloat(cngnBalance).toFixed(4)
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error('Error loading wallet info:', error);
      if (error instanceof Error) {
        setWalletError(error.message);
      } else {
        setWalletError('Failed to load wallet data');
      }
      
      setStats({
        totalSigners: 0,
        activeSigners: 0,
        threshold: 0,
        pendingTransactions: 0,
        totalTransactions: 0,
        balance: '0',
        cngnBalance: '0'
      });
      setIsCurrentUserSigner(false);
    } finally {
      setIsLoadingWalletInfo(false);
    }
  };

  const loadTransactions = async () => {
    if (!selectedWallet) return;
    
    try {
      const txs = await contractService.getAllTransactions(selectedWallet);
      
      // Check approval status for current user if they're a signer
      if (isCurrentUserSigner && address) {
        const txsWithApprovalStatus = await Promise.all(
          txs.map(async (tx) => {
            try {
              const approvalStatus = await contractService.getTransactionApprovalStatus(
                selectedWallet,
                tx.id,
                address
              );
              return {
                ...tx,
                userHasApproved: approvalStatus.hasApproved
              };
            } catch (error) {
              console.error(`Error getting approval status for tx ${tx.id}:`, error);
              return {
                ...tx,
                userHasApproved: false
              };
            }
          })
        );
        setTransactions(txsWithApprovalStatus);
      } else {
        setTransactions(txs);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  // Button click handlers with debug logging
  const handleNewPayment = () => {
    console.log('NEW PAYMENT BUTTON CLICKED');
    console.log('selectedWallet:', selectedWallet);
    console.log('isCurrentUserSigner:', isCurrentUserSigner);
    setShowTransactionProposer(true);
    console.log('showTransactionProposer set to true');
  };

  const handleBulkPayment = () => {
    console.log('BULK PAYMENT BUTTON CLICKED');
    console.log('selectedWallet:', selectedWallet);
    setShowBulkPayment(true);
    console.log('showBulkPayment set to true');
  };

  const handleSignerManager = () => {
    setShowSignerManager(true);
  };

  const handleEditWalletName = (walletAddress: string, currentName: string) => {
    setEditingWalletAddress(walletAddress);
    setEditingWalletName(currentName);
    setShowWalletNameEditor(true);
  };

  const handleWalletNameUpdated = (newName: string) => {
    // Update the local state to reflect the name change
    setShowWalletNameEditor(false);
    // Force a refresh of the wallet data
    refreshWalletData();
  };

  const approveTransaction = (transaction: TransactionInfo) => {
    setSelectedTransaction(transaction);
    setShowTransactionApprover(true);
  };

  const executeTransaction = (transaction: TransactionInfo) => {
    setSelectedTransaction(transaction);
    setShowTransactionExecutor(true);
  };

  const handleTransactionAction = () => {
    // Always refresh the wallet list to catch newly created treasuries
    loadUserWallets();
    
    if (selectedWallet) {
      loadTransactions();
      loadWalletInfo();
    }
  };

  const refreshWalletData = async () => {
    if (selectedWallet) {
      setIsRefreshing(true);
      try {
        await Promise.all([loadWalletInfo(), loadTransactions()]);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      
      await Promise.all([
        loadUserWallets(),
        selectedWallet ? loadWalletInfo() : Promise.resolve(),
        selectedWallet ? loadTransactions() : Promise.resolve()
      ]);
      
      // Show success feedback
      setCopiedAddress('refresh-success');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setWalletError('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getWalletDisplayName = (walletAddress: string, index: number) => {
    if (pendingTreasuryName) {
      return pendingTreasuryName;
    }
    return walletNamingService.getWalletName(walletAddress) || 
           walletNamingService.generateDefaultName(index);
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getStatusIcon = (executed: boolean, approvalCount: number, threshold: number) => {
    if (executed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (approvalCount >= threshold) {
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    } else {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (executed: boolean, approvalCount: number, threshold: number) => {
    if (executed) {
      return 'bg-green-100 text-green-800';
    } else if (approvalCount >= threshold) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (executed: boolean, approvalCount: number, threshold: number) => {
    if (executed) {
      return 'executed';
    } else if (approvalCount >= threshold) {
      return 'approved';
    } else {
      return 'pending';
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {copiedAddress && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>
            {copiedAddress === 'refresh-success' 
              ? 'Data refreshed successfully!' 
              : 'Address copied to clipboard!'
            }
          </span>
        </div>
      )}

      {/* Loading state to prevent hydration issues */}
      {!mounted && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Loading SecureVault...
            </h2>
            <p className="text-gray-600">
              Initializing enterprise treasury connection
            </p>
          </div>
        </div>
      )}

      {mounted && (
        <>
          {/* Treasury Selection */}
          {userWallets.length > 0 && !selectedWallet && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Select Enterprise Treasury</h2>
                    <p className="text-blue-100 text-lg">Choose a treasury to manage transactions and signers</p>
                  </div>
                  
                  {/* Refresh button for wallet list */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={refreshAllData}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh treasury list"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-8 space-y-4">
                  {userWallets.map((wallet, index) => (
                    <div 
                      key={wallet}
                      className="p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900">
                            {getWalletDisplayName(wallet, index)}
                          </h4>
                          <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block mt-1">
                            {wallet.slice(0, 8)}...{wallet.slice(-6)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">Active Treasury</span>
                          </div>
                          <p className="text-xs text-gray-500">Click to manage</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWalletName(wallet, getWalletDisplayName(wallet, index));
                            }}
                            className="mt-2 p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            title="Edit treasury name"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-8 pt-0">
                  <button
                    onClick={() => setShowWalletCreator(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl text-lg font-bold transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create New Enterprise Treasury</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Treasury Dashboard */}
          {selectedWallet && (
            <div className="max-w-7xl mx-auto">
              {/* Professional Account Header */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => setSelectedWallet('')}
                      className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-xl">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
                        {getWalletDisplayName(selectedWallet, userWallets.indexOf(selectedWallet))}
                      </h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <p className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                          {selectedWallet.slice(0, 8)}...{selectedWallet.slice(-6)}
                        </p>
                        <button
                          onClick={() => copyAddress(selectedWallet)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                          title="Copy address"
                        >
                          {copiedAddress === selectedWallet ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
                          ● Active Treasury
                        </span>
                        <span className="text-sm text-gray-600">
                          {stats.threshold}-of-{stats.totalSigners} Multi-Signature
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href={`https://sepolia.basescan.org/address/${selectedWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                    >
                      View on BaseScan →
                    </a>
                    <button
                      onClick={() => setShowWalletCreator(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Treasury</span>
                    </button>
                    <button
                      onClick={refreshAllData}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh all wallet data"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State for Wallet Info */}
              {isLoadingWalletInfo && (
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Loading Treasury Details
                  </h3>
                  <p className="text-gray-600">
                    Fetching treasury information and transactions...
                  </p>
                </div>
              )}

              {/* Error State */}
              {walletError && !isLoadingWalletInfo && (
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 mb-8">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="w-8 h-8 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-900 mb-3">
                        Treasury Error
                      </h3>
                      <p className="text-red-700 mb-4 text-lg">{walletError}</p>
                      <div className="space-y-2 text-sm text-red-600">
                        <p>• This treasury address may not be a valid multi-signature contract</p>
                        <p>• The contract may not be deployed on Base Sepolia testnet</p>
                        <p>• The contract may have been created with incorrect parameters</p>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <button
                          onClick={refreshWalletData}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200"
                        >
                          Try Again
                        </button>
                        <a
                          href={`https://sepolia.basescan.org/address/${selectedWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-white border border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200"
                        >
                          View on BaseScan →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Treasury Content */}
              {!isLoadingWalletInfo && !walletError && (
                <>
                  {/* Enterprise Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Treasury Balance</p>
                          <p className="text-3xl font-bold text-gray-900">
                            ₦{parseFloat(stats.cngnBalance).toLocaleString('en-NG', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            cNGN Token Balance
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Authorized Signers</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.totalSigners}</p>
                          <p className="text-sm text-gray-500 mt-1">{stats.threshold} required to approve</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending Approvals</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                          <p className="text-sm text-amber-600 mt-1">
                            {stats.pendingTransactions > 0 ? 'Requires attention' : 'All clear'}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Transactions</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
                          <p className="text-sm text-gray-500 mt-1">All-time activity</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Quick Actions */}
                    <div className="space-y-6">
                      {/* Quick Actions */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                        <div className="space-y-4">
                          {isCurrentUserSigner ? (
                            <>
                              <button
                                onClick={handleNewPayment}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-3"
                              >
                                <Send className="w-5 h-5" />
                                <span>New Payment</span>
                              </button>
                              
                              <button
                                onClick={handleBulkPayment}
                                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-3"
                              >
                                <Users className="w-5 h-5" />
                                <span>Bulk Payroll</span>
                              </button>
                              
                              <button
                                onClick={handleSignerManager}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-3"
                              >
                                <Settings className="w-5 h-5" />
                                <span>Manage Signers</span>
                              </button>
                            </>
                          ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="font-medium">Access Restricted</p>
                              <p className="text-sm mt-1">You are not an authorized signer</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Signers List */}
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Authorized Signers</h3>
                        <div className="space-y-3">
                          {walletInfo?.signers.map((signer, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold ${
                                  signer === address 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {signer.slice(0, 8)}...{signer.slice(-6)}
                                    </p>
                                    {signer === address && (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">Authorized Signer</p>
                                </div>
                              </div>
                              <button
                                onClick={() => copyAddress(signer)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                title="Copy address"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Transactions */}
                    <div className="lg:col-span-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                            <p className="text-gray-600 mt-1">Track all treasury transactions and approvals</p>
                          </div>
                          {isCurrentUserSigner && (
                            <button
                              onClick={handleNewPayment}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg font-medium"
                            >
                              <Send className="w-4 h-4" />
                              <span>New Transaction</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {transactions.slice(0, 10).map((tx, index) => (
                            <div key={tx.id} className="flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-xl hover:shadow-lg transition-all duration-200">
                              <div className="flex items-center space-x-4">
                                {getStatusIcon(tx.executed, tx.approvalCount, tx.threshold)}
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="font-semibold text-gray-900">
                                      {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                                    </p>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                      Payment
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    ₦{parseFloat(ethers.formatEther(tx.value)).toLocaleString()} • Transaction #{tx.id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {tx.approvalCount}/{tx.threshold} Approvals
                                  </p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tx.executed, tx.approvalCount, tx.threshold)}`}>
                                    {getStatusText(tx.executed, tx.approvalCount, tx.threshold)}
                                  </span>
                                </div>
                                {!tx.executed && isCurrentUserSigner && (
                                  <div className="flex space-x-2">
                                    {tx.approvalCount < tx.threshold && (
                                      <button
                                        onClick={() => approveTransaction(tx)}
                                        disabled={tx.userHasApproved}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                          tx.userHasApproved
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                        title={
                                          tx.userHasApproved
                                            ? 'You have already approved this transaction'
                                            : 'Approve this transaction'
                                        }
                                      >
                                        {tx.userHasApproved ? 'Already Approved' : 'Approve'}
                                      </button>
                                    )}
                                    {tx.approvalCount >= tx.threshold && (
                                      <button
                                        onClick={() => executeTransaction(tx)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                                        title="Execute this transaction"
                                      >
                                        Execute
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {/* Show approval status for current user */}
                                {!tx.executed && isCurrentUserSigner && address && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {tx.userHasApproved ? (
                                      <span className="text-blue-600">✓ You approved this transaction</span>
                                    ) : tx.approvalCount < tx.threshold ? (
                                      <span>You can approve this transaction</span>
                                    ) : (
                                      <span className="text-green-600">✓ Ready to execute</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {transactions.length === 0 && (
                            <div className="text-center py-16 text-gray-500">
                              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10 text-gray-400" />
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h4>
                              <p className="text-gray-600 mb-6">Start by creating your first treasury transaction</p>
                              {isCurrentUserSigner && (
                                <button
                                  onClick={handleNewPayment}
                                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg"
                                >
                                  Create First Transaction
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoadingWallets && (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Loading Your Enterprise Treasuries
                </h2>
                <p className="text-gray-600 text-lg">
                  Fetching your multi-signature treasuries from the blockchain...
                </p>
              </div>
            </div>
          )}

          {/* Wallet Creation Section */}
          {userWallets.length === 0 && !isLoadingWallets && (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-12 text-white">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">
                    Welcome to Enterprise Treasury
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed">
                    Create your first SecureVault treasury to start managing digital assets with enterprise-grade security. 
                    Multi-signature protection ensures your cNGN assets are protected by multiple authorized signers.
                  </p>
                </div>
              </div>
              
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Multi-Sig Security</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">cNGN Native</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Team Management</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowWalletCreator(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xl px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center space-x-4 mx-auto"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Your First Treasury</span>
                  </button>
                  
                  {/* Refresh button for when no wallets exist */}
                  <div className="mt-6">
                    <button
                      onClick={refreshAllData}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                      title="Refresh to check for new treasuries"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                  </div>
                  
                  {!address && (
                    <p className="text-sm text-gray-500 mt-6">
                      Please connect your wallet to get started
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showTransactionProposer && (
        <TransactionProposer
          walletAddress={selectedWallet || ''}
          onTransactionProposed={handleTransactionAction}
          onClose={() => setShowTransactionProposer(false)}
        />
      )}

      {showBulkPayment && (
        <BulkPayment
          walletAddress={selectedWallet || ''}
          onBulkPaymentProposed={handleTransactionAction}
          onClose={() => setShowBulkPayment(false)}
        />
      )}

      {showSignerManager && walletInfo && (
        <SignerManager
          walletAddress={selectedWallet || ''}
          currentSigners={walletInfo.signers}
          currentThreshold={walletInfo.threshold}
          onSignerUpdated={handleTransactionAction}
          onClose={() => setShowSignerManager(false)}
        />
      )}

      {showWalletCreator && (
        <WalletCreator
          onWalletCreated={handleTransactionAction}
          onClose={() => setShowWalletCreator(false)}
        />
      )}

      {showWalletNameEditor && (
        <WalletNameEditor
          walletAddress={editingWalletAddress}
          currentName={editingWalletName}
          onNameUpdated={handleWalletNameUpdated}
          onClose={() => setShowWalletNameEditor(false)}
        />
      )}

      {showTransactionApprover && selectedTransaction && (
        <TransactionApprover
          walletAddress={selectedWallet || ''}
          transaction={selectedTransaction}
          onTransactionApproved={handleTransactionAction}
          onClose={() => setShowTransactionApprover(false)}
        />
      )}

      {showTransactionExecutor && selectedTransaction && (
        <TransactionExecutor
          walletAddress={selectedWallet || ''}
          transaction={selectedTransaction}
          onTransactionExecuted={handleTransactionAction}
          onClose={() => setShowTransactionExecutor(false)}
        />
      )}
    </div>
  );
}