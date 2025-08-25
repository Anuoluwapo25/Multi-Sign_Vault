'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MultisigContract } from '../app/index';
import { Send, AlertCircle, CheckCircle, X, Copy, ExternalLink, Globe, Building2 } from 'lucide-react';
import { ethers } from 'ethers';
import { contractService, TOKEN_ADDRESSES, TokenBalance } from '../lib/contractService';

interface TransactionProposerProps {
  walletAddress: string;
  onTransactionProposed?: () => void;
  onClose?: () => void;
}

export default function TransactionProposer({ walletAddress, onTransactionProposed, onClose }: TransactionProposerProps) {
  const { address } = useAccount();
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [ngn_rate, setNgnRate] = useState<number>(1); // cNGN to NGN rate

  const { data: proposeData, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: proposeData,
  });

  const loadTokenBalances = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const balances = await contractService.getAllTokenBalances(walletAddress);
      setTokenBalances(balances);
    } catch (error) {
      console.error('Error loading token balances:', error);
    }
  }, [walletAddress]);

  const loadExchangeRates = useCallback(async () => {
    try {
      // In a real implementation, fetch from CoinGecko or similar API
      // For now, assuming 1:1 cNGN to NGN
      setNgnRate(1);
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  }, []);

  // Load token balances and exchange rates
  useEffect(() => {
    loadTokenBalances();
    loadExchangeRates();
  }, [loadTokenBalances, loadExchangeRates]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!to.trim()) {
      newErrors.to = 'Recipient address is required';
    } else if (!ethers.isAddress(to)) {
      newErrors.to = 'Invalid Ethereum address';
    }

    if (!value.trim()) {
      newErrors.value = 'Amount is required';
    } else {
      try {
        const parsedValue = parseFloat(value);
        if (parsedValue <= 0) {
          newErrors.value = 'Amount must be greater than 0';
        }

        // Check if user has sufficient balance
        const tokenBalance = tokenBalances.find(b => b.symbol === 'cNGN');
        if (tokenBalance && parsedValue > parseFloat(tokenBalance.balance)) {
          newErrors.value = `Insufficient cNGN balance`;
        }
      } catch {
        newErrors.value = 'Invalid amount';
      }
    }

    if (!description.trim()) {
      newErrors.description = 'Transaction description is required for audit purposes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    try {
      // For cNGN transfers
      const tokenAddress = TOKEN_ADDRESSES.cNGN;
      const transactionTo = tokenAddress;
      const transactionData = await contractService.encodeTokenTransfer(tokenAddress, to, value);

      writeContract({
        address: walletAddress as `0x${string}`,
        abi: MultisigContract.abi,
        functionName: 'proposeTransaction',
        args: [transactionTo, '0', transactionData],
      });
    } catch (error) {
      console.error('Error proposing transaction:', error);
    }
  };

  const handleSuccess = () => {
    setStep('success');
    if (onTransactionProposed) {
      onTransactionProposed();
    }
  };

  if (isSuccess && step !== 'success') {
    handleSuccess();
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getTokenBalance = (symbol: string) => {
    const balance = tokenBalances.find(b => b.symbol === symbol);
    return balance ? parseFloat(balance.balance).toFixed(4) : '0';
  };

  const getNgnValue = () => {
    if (value) {
      return (parseFloat(value) * ngn_rate).toLocaleString();
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">New Enterprise Payment</h2>
                <p className="text-blue-100">Propose a new treasury transaction</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-6">
              {/* Treasury Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">From Enterprise Treasury</p>
                    <p className="text-sm text-blue-600 font-mono">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Asset Selection - Only cNGN supported */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Payment Asset
                </label>
                <div className="flex space-x-3">
                  <button
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl border-2 border-blue-500 bg-blue-50"
                  >
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">cNGN</span>
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="0x... (Recipient wallet address)"
                  className={`w-full border-2 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.to ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {errors.to && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.to}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Amount (cNGN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={`0.00 cNGN`}
                    className={`w-full border-2 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                      errors.value ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                  {value && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-gray-600">≈ ₦{getNgnValue()}</span>
                    </div>
                  )}
                </div>
                {errors.value && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.value}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Available: {getTokenBalance('cNGN')} cNGN
                </p>
              </div>

              {/* Transaction Description */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Transaction Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Monthly salary payment, Vendor invoice #12345"
                  className={`w-full border-2 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  Required for audit trail and compliance reporting
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!address}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl text-lg font-bold transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Enterprise Payment
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4 text-lg">Enterprise Payment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Asset:</span>
                    <span className="text-blue-900 font-semibold">cNGN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Amount:</span>
                    <span className="text-blue-900 font-semibold">{value} cNGN</span>
                  </div>
                  {value && (
                    <div className="flex justify-between">
                      <span className="text-blue-700 font-medium">NGN Value:</span>
                      <span className="text-blue-900 font-semibold">₦{getNgnValue()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">To:</span>
                    <span className="text-blue-900 font-mono text-xs">
                      {to.slice(0, 8)}...{to.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Description:</span>
                    <span className="text-blue-900 font-semibold">{description}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Enterprise Treasury Transaction
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      This payment will be proposed to your treasury signers for approval. 
                      Multiple approvals are required before execution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg"
                >
                  {isPending ? 'Proposing...' : isConfirming ? 'Confirming...' : 'Propose Payment'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Payment Proposed Successfully!
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Your cNGN payment has been proposed to the treasury. 
                  Other signers will now review and approve this transaction.
                </p>
                {proposeData && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Transaction Hash</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-mono">
                        {proposeData.slice(0, 12)}...{proposeData.slice(-8)}
                      </p>
                      <button
                        onClick={() => window.open(`https://sepolia.basescan.org/tx/${proposeData}`, '_blank')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View on BaseScan"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}