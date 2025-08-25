'use client';

import { useState } from 'react';
import MPCWalletDashboard from '../../components/WalletDashboard';
import WalletCreator from '../../components/WalletCreator';
import { Plus, Wallet, Building2, Globe } from 'lucide-react';
import Link from 'next/link';

export default function MPCWalletPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'create'>('dashboard');
  const [pendingTreasuryName, setPendingTreasuryName] = useState<string>('');

  const handleWalletCreated = () => {
    // Force dashboard to refresh by updating the key
    setRefreshKey(prev => prev + 1);
    // Switch back to dashboard view
    setActiveView('dashboard');
  };

  const handleTreasuryNameSet = (name: string) => {
    setPendingTreasuryName(name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
                    SecureVault
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Enterprise Treasury</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>Nigerian Enterprise Solution</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 shadow-md' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>My Treasuries</span>
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeView === 'create' 
                    ? 'bg-blue-100 text-blue-700 shadow-md' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Create Treasury</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-amber-800">Base Sepolia Testnet</span>
              </div>
              <button 
                onClick={() => setActiveView('create')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-lg font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Treasury</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                activeView === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700 shadow-md' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Treasuries</span>
            </button>
            <button
              onClick={() => setActiveView('create')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                activeView === 'create' 
                  ? 'bg-blue-100 text-blue-700 shadow-md' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Create</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'dashboard' && (
          <>
            <MPCWalletDashboard 
              key={refreshKey} 
              pendingTreasuryName={pendingTreasuryName}
            />
          </>
        )}
        
        {activeView === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4">
                Create Enterprise Treasury
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Set up a secure multi-signature treasury for your Nigerian enterprise with cNGN support
              </p>
            </div>
            <WalletCreator onWalletCreated={handleWalletCreated} onTreasuryNameSet={handleTreasuryNameSet} />
          </div>
        )}
      </div>
    </div>
  );
}