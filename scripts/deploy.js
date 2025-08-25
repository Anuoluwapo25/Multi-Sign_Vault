#!/usr/bin/env node

/**
 * Deployment script for SecureVault Stacks contracts
 * This script deploys the multisig contracts to Stacks blockchain
 */

const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const { 
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion
} = require('@stacks/transactions');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK = process.env.STACKS_NETWORK || 'testnet';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601';

// Initialize network
const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();

// Contract files
const contracts = [
  {
    name: 'sip-010-trait',
    file: 'sip-010-trait.clar',
    dependencies: []
  },
  {
    name: 'multisig',
    file: 'multisig.clar',
    dependencies: ['sip-010-trait']
  },
  {
    name: 'multisig-factory',
    file: 'multisig-factory.clar',
    dependencies: ['multisig']
  },
  {
    name: 'cngn-stacks-token',
    file: 'cngn-stacks-token.clar',
    dependencies: ['sip-010-trait']
  }
];

async function readContractFile(filename) {
  const contractPath = path.join(__dirname, '..', 'contracts', filename);
  return fs.readFileSync(contractPath, 'utf8');
}

async function deployContract(contractName, contractCode, privateKey) {
  const senderKey = createStacksPrivateKey(privateKey);
  const senderAddress = getAddressFromPrivateKey(
    privateKey,
    NETWORK === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet
  );

  console.log(`Deploying ${contractName} from ${senderAddress}...`);

  const txOptions = {
    contractName,
    codeBody: contractCode,
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 10000, // 0.01 STX
  };

  const transaction = await makeContractDeploy(txOptions);
  
  try {
    const broadcastResponse = await broadcastTransaction(transaction, network);
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`Contract Address: ${senderAddress}.${contractName}`);
    return {
      txid: broadcastResponse.txid,
      contractAddress: `${senderAddress}.${contractName}`,
      success: true
    };
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    return {
      error: error.message,
      success: false
    };
  }
}

async function waitForTransaction(txid) {
  console.log(`Waiting for transaction ${txid} to be confirmed...`);
  
  // Simple polling mechanism
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch(`${network.coreApiUrl}/extended/v1/tx/${txid}`);
      const txData = await response.json();
      
      if (txData.tx_status === 'success') {
        console.log(`✅ Transaction ${txid} confirmed!`);
        return true;
      } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
        console.error(`❌ Transaction ${txid} failed:`, txData.tx_result);
        return false;
      }
    } catch (error) {
      // Transaction might not be available yet
    }
    
    // Wait 10 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.log(`⏰ Transaction ${txid} still pending after 5 minutes`);
  return false;
}

async function main() {
  console.log(`🚀 Starting deployment to ${NETWORK}...`);
  console.log(`Network: ${network.coreApiUrl}`);
  
  const deploymentResults = [];
  
  for (const contract of contracts) {
    try {
      console.log(`\n📄 Reading contract: ${contract.file}`);
      const contractCode = await readContractFile(contract.file);
      
      console.log(`📤 Deploying contract: ${contract.name}`);
      const result = await deployContract(contract.name, contractCode, PRIVATE_KEY);
      
      deploymentResults.push({
        name: contract.name,
        ...result
      });
      
      if (result.success) {
        // Wait for confirmation before deploying next contract
        await waitForTransaction(result.txid);
        
        // Wait additional time between deployments
        console.log('⏳ Waiting 30 seconds before next deployment...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      } else {
        console.error(`❌ Stopping deployment due to failure in ${contract.name}`);
        break;
      }
    } catch (error) {
      console.error(`❌ Error deploying ${contract.name}:`, error);
      deploymentResults.push({
        name: contract.name,
        error: error.message,
        success: false
      });
      break;
    }
  }
  
  // Save deployment results
  const resultsFile = path.join(__dirname, '..', `deployment-results-${NETWORK}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(deploymentResults, null, 2));
  
  console.log('\n📊 Deployment Summary:');
  console.log('========================');
  
  deploymentResults.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.name}: ${result.contractAddress}`);
    } else {
      console.log(`❌ ${result.name}: ${result.error}`);
    }
  });
  
  console.log(`\n📁 Results saved to: ${resultsFile}`);
  
  // Generate environment variables
  if (deploymentResults.every(r => r.success)) {
    console.log('\n🔧 Environment Variables:');
    console.log('==========================');
    deploymentResults.forEach(result => {
      const envName = `NEXT_PUBLIC_${result.name.toUpperCase().replace('-', '_')}_CONTRACT`;
      console.log(`${envName}=${result.contractAddress}`);
    });
  }
}

// Run deployment
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deployContract, waitForTransaction };
