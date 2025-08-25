'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { MultisigFactoryContract } from '../app/index';

interface ContractVerifierProps {
  onClose?: () => void;
}

export default function ContractVerifier({ onClose }: ContractVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    message: string;
  } | null>(null);

  const verifyContract = async () => {
    setIsVerifying(true);
    try {
      const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
      const code = await provider.getCode(MultisigFactoryContract.address);
      
      if (code === '0x') {
        setVerificationResult({
          exists: false,
          message: 'Contract not found at the specified address'
        });
      } else {
        // Try to call a view function to verify it's the right contract
        const contract = new ethers.Contract(
          MultisigFactoryContract.address,
          MultisigFactoryContract.abi,
          provider
        );
        
        // Try to call a simple view function
        await contract.getOrgWallets('0x0000000000000000000000000000000000000000');
        
        setVerificationResult({
          exists: true,
          message: 'Contract verified successfully!'
        });
      }
    } catch (error) {
      setVerificationResult({
        exists: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Verify Contract</h2>
          <p className="text-gray-600 mb-6">
            Verify that the MultiSigFactory contract is deployed and accessible.
          </p>
          
          <button
            onClick={verifyContract}
            disabled={isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Contract'}
          </button>
          
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-xl ${
              verificationResult.exists 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-semibold ${
                verificationResult.exists ? 'text-green-800' : 'text-red-800'
              }`}>
                {verificationResult.message}
              </p>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 