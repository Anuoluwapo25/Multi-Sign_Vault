'use client';

import { useState } from 'react';
import { useStacks } from '../app/providers';
import { Upload, Users, AlertCircle, CheckCircle, X, Download, Globe, Building2 } from 'lucide-react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { AnchorMode, PostConditionMode, stringUtf8CV, uintCV } from '@stacks/transactions';
import Papa from 'papaparse';

interface BulkPaymentProps {
  walletAddress: string;
  onBulkPaymentProposed?: () => void;
  onClose?: () => void;
}

interface PaymentRow {
  name: string;
  address: string;
  amount: string;
  description: string;
}

export default function BulkPayment({ walletAddress, onBulkPaymentProposed, onClose }: BulkPaymentProps) {
  const [step, setStep] = useState<'upload' | 'review' | 'confirm' | 'success'>('upload');
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState('0');
  const [processing, setProcessing] = useState(false);
  const { userSession } = useStacks();

  // Validate Stacks address format
  const isValidStacksAddress = (address: string): boolean => {
    return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(address) && 
           (address.startsWith('SP') || address.startsWith('ST') || address.startsWith('SM'));
  };

  const downloadTemplate = () => {
    const templateData = [
      { name: 'John Doe', address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', amount: '150000', description: 'Software Engineer - January 2024' },
      { name: 'Jane Smith', address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', amount: '180000', description: 'Product Manager - January 2024' },
      { name: 'David Johnson', address: 'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS', amount: '120000', description: 'UI/UX Designer - January 2024' }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stacks_payroll_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file as File, {
      header: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results: Papa.ParseResult<PaymentRow>) => {
        try {
          if (results.errors && results.errors.length > 0) {
            setErrors(results.errors.map(error => `Row ${error.row}: ${error.message}`));
            return;
          }
          
          const data = results.data as PaymentRow[];
          const validationErrors: string[] = [];
          const validPayments: PaymentRow[] = [];

          data.forEach((row, index) => {
            const rowNumber = index + 1;
            
            // Validate required fields
            if (!row.name?.trim()) {
              validationErrors.push(`Row ${rowNumber}: Name is required`);
            }
            if (!row.address?.trim()) {
              validationErrors.push(`Row ${rowNumber}: Address is required`);
            } else if (!isValidStacksAddress(row.address.trim())) {
              validationErrors.push(`Row ${rowNumber}: Invalid Stacks address (must start with SP, ST, or SM)`);
            }
            if (!row.amount?.trim()) {
              validationErrors.push(`Row ${rowNumber}: Amount is required`);
            } else {
              const amount = parseFloat(row.amount.trim());
              if (isNaN(amount) || amount <= 0) {
                validationErrors.push(`Row ${rowNumber}: Invalid amount`);
              }
            }
            if (!row.description?.trim()) {
              validationErrors.push(`Row ${rowNumber}: Description is required`);
            }

            // If row is valid, add to payments
            if (row.name?.trim() && row.address?.trim() && row.amount?.trim() && row.description?.trim()) {
              if (isValidStacksAddress(row.address.trim()) && !isNaN(parseFloat(row.amount.trim())) && parseFloat(row.amount.trim()) > 0) {
                validPayments.push({
                  name: row.name.trim(),
                  address: row.address.trim(),
                  amount: row.amount.trim(),
                  description: row.description.trim()
                });
              }
            }
          });

          if (validationErrors.length > 0) {
            setErrors(validationErrors);
          } else {
            setErrors([]);
            setPayments(validPayments);
            
            // Calculate total
            const total = validPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
            setTotalAmount(total.toString());
            
            setStep('review');
          }
        } catch {
          setErrors(['Failed to parse CSV file. Please check the format.']);
        }
      }
    });
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      // For demonstration, we'll create a single bulk payment proposal
      // In a real implementation, you'd call your multisig contract
      
      const network = new StacksMainnet(); // or StacksTestnet() for testnet

      // Convert payments to contract arguments format
      const recipients = payments.map(p => p.address);
      const amounts = payments.map(p => Math.floor(parseFloat(p.amount) * 1000000)); // Convert to microSTX
      const descriptions = payments.map(p => p.description);

      await openContractCall({
        network,
        anchorMode: AnchorMode.Any,
        contractAddress: walletAddress, // Your multisig contract address
        contractName: 'multisig-treasury', // Your contract name
        functionName: 'propose-bulk-payment',
        functionArgs: [
          // You'll need to adjust these based on your actual contract function signature
          uintCV(recipients.length),
          // In a real contract, you'd pass arrays of recipients and amounts
        ],
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data) => {
          console.log('Bulk payment proposed:', data);
          setStep('success');
          if (onBulkPaymentProposed) {
            onBulkPaymentProposed();
          }
        },
        onCancel: () => {
          setProcessing(false);
        },
      });

    } catch (error) {
      console.error('Error proposing bulk payments:', error);
      setErrors(['Failed to propose bulk payments. Please try again.']);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-yellow-700 p-6 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk STX Payment</h2>
                <p className="text-orange-100">Upload CSV for batch STX payments</p>
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
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Payment Asset
                </label>
                <div className="flex space-x-3">
                  <button
                    className="flex items-center space-x-2 px-4 py-3 rounded-xl border-2 border-orange-500 bg-orange-50"
                  >
                    <Globe className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold">STX</span>
                  </button>
                </div>
              </div>

              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-3">CSV Template Required</h3>
                <p className="text-blue-800 mb-4">
                  Download our template to ensure proper formatting for bulk STX payments.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-3">
                  Upload Payroll CSV
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-200">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-gray-600 mb-4">
                    Required columns: name, address, amount, description
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                  </label>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Validation Errors
                  </h3>
                  <ul className="text-red-800 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Review Bulk Payment</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-orange-600">{payments.length}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Asset</p>
                    <p className="text-lg font-bold text-orange-900">STX</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Total Amount</p>
                    <p className="text-lg font-bold text-orange-900">{parseFloat(totalAmount).toLocaleString()} STX</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Recipients</p>
                    <p className="text-lg font-bold text-orange-900">{payments.length}</p>
                  </div>
                </div>
              </div>

              {/* Payment List */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Payment Recipients</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {payments.map((payment, index) => (
                    <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{payment.name}</h5>
                          <p className="text-sm text-gray-600 font-mono">{payment.address.slice(0, 8)}...{payment.address.slice(-6)}</p>
                          <p className="text-sm text-gray-600">{payment.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{parseFloat(payment.amount).toLocaleString()} STX</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back to Upload
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg"
                >
                  Proceed to Confirm
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Bulk Payment</h3>
                <p className="text-gray-600">
                  This will create a bulk payment proposal requiring multi-signature approval.
                </p>
              </div>

              {/* Final Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-4">Transaction Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-orange-700">Payment Asset:</span>
                    <span className="text-orange-900 font-semibold">STX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Total Recipients:</span>
                    <span className="text-orange-900 font-semibold">{payments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Total Amount:</span>
                    <span className="text-orange-900 font-semibold">{parseFloat(totalAmount).toLocaleString()} STX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">Transaction Type:</span>
                    <span className="text-orange-900 font-semibold">Bulk Payment Proposal</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Enterprise Bulk Payment Process
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      This bulk payment will be created as a single proposal requiring multi-signature approval. 
                      This ensures maximum security and auditability for your enterprise treasury.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back to Review
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  {processing ? 'Creating Proposal...' : 'Create Bulk Payment Proposal'}
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
                  Bulk Payment Proposal Created!
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  Successfully created bulk payment proposal for {payments.length} recipients totaling{' '}
                  {parseFloat(totalAmount).toLocaleString()} STX. 
                  The payment now requires multi-signature approval before execution.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-4 rounded-xl font-bold transition-all duration-200 shadow-lg"
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