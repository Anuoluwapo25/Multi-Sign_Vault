'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MultisigContract } from '../app/index';
import { CheckCircle, X, Copy, ExternalLink, Shield } from 'lucide-react';
import { ethers } from 'ethers';
import { TransactionInfo } from '../lib/contractService';

interface TransactionApproverProps {
  walletAddress: string;
  transaction: TransactionInfo;
  onTransactionApproved?: () => void;
  onClose?: () => void;
}

export default function TransactionApprover({ walletAddress, transaction, onTransactionApproved, onClose }: TransactionApproverProps) {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');

  const { data: approveData, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  const handleApprove = async () => {
    try {
      writeContract({
        address: walletAddress as `0x${string}`,
        abi: MultisigContract.abi,
        functionName: 'approveTransaction',
        args: [transaction.id],
      });
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleSuccess = () => {
    setStep('success');
    if (onTransactionApproved) {
      onTransactionApproved();
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
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Approve Transaction</h2>
              <p className="text-sm text-gray-600">Review and approve transaction</p>
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
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-blue-700">Transaction ID:</span>
                    <span className="text-blue-900 font-mono">#{transaction.id}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-blue-700">To:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-900 font-mono">
                        {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyAddress(transaction.to)}
                        className="p-1 text-blue-400 hover:text-blue-600"
                        title="Copy address"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="text-blue-900 font-semibold">
                      {ethers.formatEther(transaction.value)} ETH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Status:</span>
                    <span className="text-blue-900">
                      {transaction.approvalCount} / {transaction.threshold} approvals
                    </span>
                  </div>
                  {transaction.data && transaction.data !== '0x' && (
                    <div className="flex justify-between items-start">
                      <span className="text-blue-700">Data:</span>
                      <span className="text-blue-900 font-mono text-xs">
                        {transaction.data.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Security Check Required
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify the transaction details carefully before approving. 
                      Once approved, this transaction can be executed if enough signers approve.
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Progress */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Approval Progress</span>
                  <span className="text-sm text-gray-600">
                    {transaction.approvalCount + 1} / {transaction.threshold}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((transaction.approvalCount + 1) / transaction.threshold) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {transaction.threshold - (transaction.approvalCount + 1)} more approval(s) needed
                </p>
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
                  onClick={handleApprove}
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Approving...' : isConfirming ? 'Confirming...' : 'Approve Transaction'}
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
                  Transaction Approved!
                </h3>
                <p className="text-gray-600 mb-4">
                  You have successfully approved this transaction. It can now be executed if enough signers have approved.
                </p>
                {approveData && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Approval Hash</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 font-mono">
                        {approveData.slice(0, 10)}...{approveData.slice(-8)}
                      </p>
                      <button
                        onClick={() => window.open(`https://sepolia.basescan.org/tx/${approveData}`, '_blank')}
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