'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MultisigContract } from '../app/index';
import { Users, Plus, Minus, AlertCircle, X, Copy, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';

interface SignerManagerProps {
  walletAddress: string;
  currentSigners: string[];
  currentThreshold: number;
  onSignerUpdated?: () => void;
  onClose?: () => void;
}

export default function SignerManager({ 
  walletAddress, 
  currentSigners, 
  currentThreshold, 
  onSignerUpdated, 
  onClose 
}: SignerManagerProps) {
  const { address } = useAccount();
  const [action, setAction] = useState<'add' | 'remove' | 'threshold'>('add');
  const [newSigner, setNewSigner] = useState('');
  const [removeSigner, setRemoveSigner] = useState('');
  const [newThreshold, setNewThreshold] = useState(currentThreshold);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: actionData, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: actionData,
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (action === 'add') {
      if (!newSigner.trim()) {
        newErrors.newSigner = 'Signer address is required';
      } else if (!ethers.isAddress(newSigner)) {
        newErrors.newSigner = 'Invalid Ethereum address';
      } else if (currentSigners.includes(newSigner.toLowerCase())) {
        newErrors.newSigner = 'Signer already exists';
      }
    } else if (action === 'remove') {
      if (!removeSigner) {
        newErrors.removeSigner = 'Please select a signer to remove';
      } else if (currentSigners.length - 1 < currentThreshold) {
        newErrors.removeSigner = `Cannot remove signer: threshold would be violated. Current threshold is ${currentThreshold} but removing would leave only ${currentSigners.length - 1} signers. Please reduce the threshold first.`;
      }
    } else if (action === 'threshold') {
      if (newThreshold <= 0 || newThreshold > currentSigners.length) {
        newErrors.newThreshold = 'Invalid threshold value';
      }
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
      if (action === 'add') {
        writeContract({
          address: walletAddress as `0x${string}`,
          abi: MultisigContract.abi,
          functionName: 'addSigner',
          args: [newSigner],
        });
      } else if (action === 'remove') {
        writeContract({
          address: walletAddress as `0x${string}`,
          abi: MultisigContract.abi,
          functionName: 'removeSigner',
          args: [removeSigner],
        });
      } else if (action === 'threshold') {
        writeContract({
          address: walletAddress as `0x${string}`,
          abi: MultisigContract.abi,
          functionName: 'updateThreshold',
          args: [newThreshold],
        });
      }
    } catch (error) {
      console.error('Error updating signers:', error);
    }
  };

  const handleSuccess = () => {
    setStep('success');
    if (onSignerUpdated) {
      onSignerUpdated();
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

  const getActionTitle = () => {
    switch (action) {
      case 'add': return 'Add Signer';
      case 'remove': return 'Remove Signer';
      case 'threshold': return 'Update Threshold';
      default: return 'Manage Signers';
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'add': return 'Add a new signer to the wallet';
      case 'remove': return 'Remove a signer from the wallet';
      case 'threshold': return 'Update the approval threshold';
      default: return 'Manage wallet signers';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getActionTitle()}</h2>
              <p className="text-sm text-gray-600">{getActionDescription()}</p>
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
          {step === 'form' && (
            <div className="space-y-6">
              {/* Action Selection */}
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAction('add')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    action === 'add' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add
                </button>
                <button
                  onClick={() => setAction('remove')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    action === 'remove' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Minus className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
                <button
                  onClick={() => setAction('threshold')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    action === 'threshold' 
                      ? 'bg-white text-green-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Threshold
                </button>
              </div>

              {/* Current Signers */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Current Signers ({currentSigners.length})</h3>
                <div className="space-y-2">
                  {currentSigners.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-700">
                          {signer.slice(0, 6)}...{signer.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyAddress(signer)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Copy address"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">Signer {index + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Current threshold: <span className="font-semibold text-gray-900">{currentThreshold} of {currentSigners.length}</span>
                  </p>
                  {currentSigners.length - 1 < currentThreshold && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      <p className="font-medium mb-1">⚠️ Signer Removal Blocked</p>
                      <p>Threshold too high to remove signers. Reduce threshold first.</p>
                    </div>
                  )}
                  {currentSigners.length - 1 >= currentThreshold && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      <p className="font-medium mb-1">✅ Signer Removal Allowed</p>
                      <p>You can remove up to {currentSigners.length - currentThreshold} signer(s).</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Form */}
              {action === 'add' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Signer Address
                  </label>
                  <input
                    type="text"
                    value={newSigner}
                    onChange={(e) => setNewSigner(e.target.value)}
                    placeholder="0x..."
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.newSigner ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.newSigner && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.newSigner}
                    </p>
                  )}
                </div>
              )}

              {action === 'remove' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Signer to Remove
                  </label>
                  <select
                    value={removeSigner}
                    onChange={(e) => setRemoveSigner(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                      errors.removeSigner ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a signer...</option>
                    {currentSigners.map((signer, index) => (
                      <option key={index} value={signer}>
                        {signer.slice(0, 6)}...{signer.slice(-4)} (Signer {index + 1})
                      </option>
                    ))}
                  </select>
                  {errors.removeSigner && (
                    <div className="mt-3">
                      <p className="text-sm text-red-600 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.removeSigner}
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium mb-2">💡 Solution:</p>
                        <p className="text-sm text-blue-700 mb-3">
                          To remove this signer, you need to reduce the threshold first:
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm text-blue-700">
                            • Current: {currentThreshold} of {currentSigners.length} signers required
                          </p>
                          <p className="text-sm text-blue-700">
                            • After removal: {currentSigners.length - 1} signers will remain
                          </p>
                          <p className="text-sm text-blue-700">
                            • New threshold must be ≤ {currentSigners.length - 1}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAction('threshold')}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Update Threshold First
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {action === 'threshold' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Threshold ({newThreshold} of {currentSigners.length})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={currentSigners.length}
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {newThreshold} of {currentSigners.length} signers required to approve transactions
                  </p>
                  
                  {/* Warning when reducing threshold */}
                  {newThreshold < currentThreshold && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800 font-medium mb-2">⚠️ Threshold Reduction Warning:</p>
                      <p className="text-sm text-amber-700 mb-2">
                        Reducing the threshold from {currentThreshold} to {newThreshold} will:
                      </p>
                      <ul className="text-sm text-amber-700 space-y-1 mb-3">
                        <li>• Make transactions easier to approve (less secure)</li>
                        <li>• Allow you to remove up to {currentSigners.length - newThreshold} signers</li>
                        <li>• Require only {newThreshold} approvals instead of {currentThreshold}</li>
                      </ul>
                      <p className="text-sm text-amber-700">
                        After updating the threshold, you can return to the &quot;Remove&quot; tab to remove signers.
                      </p>
                    </div>
                  )}
                  
                  {errors.newThreshold && (
                    <p className="text-sm text-red-600 mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.newThreshold}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!address}
                className="w-full btn-primary py-3 text-lg font-semibold"
              >
                Review Changes
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Action Summary</h3>
                <div className="space-y-2 text-sm">
                  {action === 'add' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Action:</span>
                        <span className="text-blue-900">Add Signer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">New Signer:</span>
                        <span className="text-blue-900 font-mono">
                          {newSigner.slice(0, 6)}...{newSigner.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">New Total:</span>
                        <span className="text-blue-900">{currentSigners.length + 1} signers</span>
                      </div>
                    </>
                  )}
                  {action === 'remove' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Action:</span>
                        <span className="text-blue-900">Remove Signer</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Remove:</span>
                        <span className="text-blue-900 font-mono">
                          {removeSigner.slice(0, 6)}...{removeSigner.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">New Total:</span>
                        <span className="text-blue-900">{currentSigners.length - 1} signers</span>
                      </div>
                    </>
                  )}
                  {action === 'threshold' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Action:</span>
                        <span className="text-blue-900">Update Threshold</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Current:</span>
                        <span className="text-blue-900">{currentThreshold} of {currentSigners.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">New:</span>
                        <span className="text-blue-900">{newThreshold} of {currentSigners.length}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Security Impact
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This action will change the wallet&apos;s security configuration. 
                      Make sure all signers are aware of this change.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending || isConfirming}
                  className="flex-1 btn-primary py-3"
                >
                  {isPending ? 'Processing...' : isConfirming ? 'Confirming...' : 'Confirm Changes'}
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
                  Signers Updated!
                </h3>
                <p className="text-gray-600 mb-4">
                  The wallet&apos;s signer configuration has been successfully updated.
                </p>
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