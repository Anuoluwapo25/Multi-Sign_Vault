'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MultisigContract } from '../app/index';
import { Play, AlertCircle, X, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { TransactionInfo } from '../lib/contractService';

interface TransactionExecutorProps {
  walletAddress: string;
  transaction: TransactionInfo;
  onTransactionExecuted?: () => void;
  onClose?: () => void;
}

export default function TransactionExecutor({ walletAddress, transaction, onTransactionExecuted, onClose }: TransactionExecutorProps) {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');

  const { data: executeData, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: executeData,
  });

  const handleExecute = async () => {
    try {
      writeContract({
        address: walletAddress as `0x${string}`,
        abi: MultisigContract.abi,
        functionName: 'executeTransaction',
        args: [transaction.id],
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
    }
  };

  const handleSuccess = () => {
    setStep('success');
    if (onTransactionExecuted) {
      onTransactionExecuted();
    }
  };

  if (isSuccess && step !== 'success') {
    handleSuccess();
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Execute Transaction</h2>
              <p className="text-sm text-gray-600">Execute approved transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Transaction Details */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-purple-700">Transaction ID:</span>
                    <span className="text-purple-900 font-mono">#{transaction.id}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-purple-700">To:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-900 font-mono">
                        {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyAddress(transaction.to)}
                        className="p-1 text-purple-400 hover:text-purple-600"
                        title="Copy address"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Amount:</span>
                    <span className="text-purple-900 font-semibold">
                      {ethers.formatEther(transaction.value)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Approvals:</span>
                    <span className="text-purple-900">
                      {transaction.approvalCount} / {transaction.threshold} ✅
                    </span>
                  </div>
                  {transaction.data && transaction.data !== '0x' && (
                    <div className="flex justify-between items-start">
                      <span className="text-purple-700">Data:</span>
                      <span className="text-purple-900 font-mono text-xs">
                        {transaction.data.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Final Execution Warning
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      This action will execute the transaction and transfer funds. 
                      This action cannot be undone once confirmed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Ready to Execute
                    </p>
                    <p className="text-sm text-green-700">
                      Transaction has received sufficient approvals ({transaction.approvalCount}/{transaction.threshold})
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Executing...' : isConfirming ? 'Confirming...' : 'Execute Transaction'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Transaction Executed!
                </h3>
                <p className="text-gray-600 mb-4">
                  The transaction has been successfully executed and funds have been transferred.
                </p>
                {executeData && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Execution Hash</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-mono">
                        {executeData.slice(0, 10)}...{executeData.slice(-8)}
                      </p>
                      <button
                        onClick={() => window.open(`https://sepolia.basescan.org/tx/${executeData}`, '_blank')}
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
                className="w-full btn-primary py-3"
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