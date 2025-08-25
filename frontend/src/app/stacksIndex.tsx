// Stacks Contract Configuration
// Replaces the Ethereum contract configuration

import { STACKS_CONFIG } from '../lib/stacksConfig';

export const StacksMultisigContract = {
  address: STACKS_CONFIG.CONTRACTS.MULTISIG,
  // Clarity contracts don't use ABIs like Solidity
  // Function calls are made directly using contract-call
};

export const StacksMultisigFactoryContract = {
  address: STACKS_CONFIG.CONTRACTS.MULTISIG_FACTORY,
};

export const StacksSIP010TraitContract = {
  address: STACKS_CONFIG.CONTRACTS.SIP010_TRAIT,
};

// Token addresses for Stacks ecosystem
export const STACKS_TOKEN_ADDRESSES = {
  'STX': 'STX',
  'USDA': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
  'cNGN': STACKS_CONFIG.TOKENS.cNGN.contractAddress,
};

// Contract function names for reference
export const MULTISIG_FUNCTIONS = {
  // Read-only functions
  IS_SIGNER: 'is-signer',
  GET_THRESHOLD: 'get-threshold',
  GET_SIGNER_COUNT: 'get-signer-count',
  GET_TRANSACTION_COUNT: 'get-transaction-count',
  GET_NONCE: 'get-nonce',
  GET_SIGNERS: 'get-signers',
  GET_TRANSACTION: 'get-transaction',
  HAS_APPROVED: 'has-approved',
  GET_WALLET_STATUS: 'get-wallet-status',
  
  // Public functions
  INITIALIZE: 'initialize',
  ADD_SIGNER: 'add-signer',
  REMOVE_SIGNER: 'remove-signer',
  UPDATE_THRESHOLD: 'update-threshold',
  PROPOSE_TRANSACTION: 'propose-transaction',
  APPROVE_TRANSACTION: 'approve-transaction',
  EXECUTE_TRANSACTION: 'execute-transaction',
  EXECUTE_STX_TRANSACTION: 'execute-stx-transaction',
  EXECUTE_TOKEN_TRANSACTION: 'execute-token-transaction',
};

export const FACTORY_FUNCTIONS = {
  // Read-only functions
  GET_CONTRACT_OWNER: 'get-contract-owner',
  GET_WALLET_COUNT: 'get-wallet-count',
  GET_ORG_WALLETS: 'get-org-wallets',
  GET_WALLET_INFO: 'get-wallet-info',
  GET_WALLET_BY_INDEX: 'get-wallet-by-index',
  WALLET_EXISTS: 'wallet-exists',
  GET_ALL_WALLETS: 'get-all-wallets',
  IS_SIGNER_IN_WALLET: 'is-signer-in-wallet',
  GET_WALLETS_FOR_SIGNER: 'get-wallets-for-signer',
  GET_WALLET_STATS: 'get-wallet-stats',
  
  // Public functions
  CREATE_WALLET: 'create-wallet',
  DEACTIVATE_WALLET: 'deactivate-wallet',
  REACTIVATE_WALLET: 'reactivate-wallet',
  UPDATE_CONTRACT_OWNER: 'update-contract-owner',
  EMERGENCY_PAUSE: 'emergency-pause',
  EMERGENCY_UNPAUSE: 'emergency-unpause',
};

export const SIP010_FUNCTIONS = {
  TRANSFER: 'transfer',
  GET_NAME: 'get-name',
  GET_SYMBOL: 'get-symbol',
  GET_DECIMALS: 'get-decimals',
  GET_BALANCE: 'get-balance',
  GET_TOTAL_SUPPLY: 'get-total-supply',
  GET_TOKEN_URI: 'get-token-uri',
};

// Error codes from contracts
export const CONTRACT_ERRORS = {
  // Multisig errors
  ERR_NOT_AUTHORIZED: 100,
  ERR_INVALID_THRESHOLD: 101,
  ERR_INVALID_SIGNER: 102,
  ERR_TRANSACTION_NOT_FOUND: 103,
  ERR_TRANSACTION_ALREADY_EXECUTED: 104,
  ERR_INSUFFICIENT_APPROVALS: 105,
  ERR_ALREADY_APPROVED: 106,
  ERR_SIGNER_ALREADY_EXISTS: 107,
  ERR_SIGNER_NOT_FOUND: 108,
  ERR_INVALID_AMOUNT: 109,
  ERR_TRANSFER_FAILED: 110,
  
  // Factory errors
  ERR_FACTORY_NOT_AUTHORIZED: 200,
  ERR_FACTORY_INVALID_THRESHOLD: 201,
  ERR_FACTORY_INVALID_SIGNERS: 202,
  ERR_WALLET_NOT_FOUND: 203,
  ERR_DEPLOYMENT_FAILED: 204,
};

// Helper function to parse contract errors
export const parseContractError = (errorCode: number): string => {
  switch (errorCode) {
    case CONTRACT_ERRORS.ERR_NOT_AUTHORIZED:
      return 'Not authorized to perform this action';
    case CONTRACT_ERRORS.ERR_INVALID_THRESHOLD:
      return 'Invalid threshold value';
    case CONTRACT_ERRORS.ERR_INVALID_SIGNER:
      return 'Invalid signer address';
    case CONTRACT_ERRORS.ERR_TRANSACTION_NOT_FOUND:
      return 'Transaction not found';
    case CONTRACT_ERRORS.ERR_TRANSACTION_ALREADY_EXECUTED:
      return 'Transaction already executed';
    case CONTRACT_ERRORS.ERR_INSUFFICIENT_APPROVALS:
      return 'Insufficient approvals to execute transaction';
    case CONTRACT_ERRORS.ERR_ALREADY_APPROVED:
      return 'Transaction already approved by this signer';
    case CONTRACT_ERRORS.ERR_SIGNER_ALREADY_EXISTS:
      return 'Signer already exists';
    case CONTRACT_ERRORS.ERR_SIGNER_NOT_FOUND:
      return 'Signer not found';
    case CONTRACT_ERRORS.ERR_INVALID_AMOUNT:
      return 'Invalid amount';
    case CONTRACT_ERRORS.ERR_TRANSFER_FAILED:
      return 'Transfer failed';
    case CONTRACT_ERRORS.ERR_WALLET_NOT_FOUND:
      return 'Wallet not found';
    case CONTRACT_ERRORS.ERR_DEPLOYMENT_FAILED:
      return 'Deployment failed';
    default:
      return `Unknown error (code: ${errorCode})`;
  }
};
