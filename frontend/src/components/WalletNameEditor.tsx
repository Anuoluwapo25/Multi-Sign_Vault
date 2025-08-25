'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';
import { walletNamingService } from '../lib/walletNaming';

interface WalletNameEditorProps {
  walletAddress: string;
  currentName: string;
  onNameUpdated: (newName: string) => void;
  onClose: () => void;
}

export default function WalletNameEditor({ walletAddress, currentName, onNameUpdated, onClose }: WalletNameEditorProps) {
  const [name, setName] = useState(currentName);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Wallet name cannot be empty');
      return;
    }

    if (trimmedName.length > 32) {
      setError('Wallet name must be 32 characters or less');
      return;
    }

    try {
      walletNamingService.setWalletName(walletAddress, trimmedName);
      onNameUpdated(trimmedName);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error saving wallet name:', err);
      setError('Failed to save wallet name');
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Treasury Name</h2>
              <p className="text-sm text-gray-600">Customize your treasury display name</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Current Wallet Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Treasury Address</p>
              <p className="text-sm text-gray-600 font-mono">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
                Treasury Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter treasury name..."
                  className={`w-full border-2 rounded-xl px-4 py-3 text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                  maxLength={32}
                  disabled={!isEditing}
                />
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {name.length}/32 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Name</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Name</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 