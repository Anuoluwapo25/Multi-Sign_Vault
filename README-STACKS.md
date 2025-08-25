# 🏛️ SecureVault Stacks - Bitcoin Smart Contracts

> **Multi-signature treasury management platform built on Stacks blockchain for Bitcoin smart contracts.**

<div align="center">

![SecureVault Stacks Logo](https://img.shields.io/badge/SecureVault-Stacks%20Bitcoin-orange?style=for-the-badge&logo=bitcoin)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks Network](https://img.shields.io/badge/Network-Stacks%20Blockchain-purple)](https://stacks.co/)
[![Bitcoin Smart Contracts](https://img.shields.io/badge/Bitcoin-Smart%20Contracts-orange)](https://clarity-lang.org/)
[![Nigerian Enterprise](https://img.shields.io/badge/🇳🇬-Nigerian%20Enterprise%20Solution-green)](https://github.com/your-repo)

</div>

## 🚀 Overview

SecureVault has been **converted from Solidity to Clarity** to run on the Stacks blockchain, bringing Bitcoin smart contract capabilities to enterprise treasury management. This conversion enables:

- **Bitcoin Security**: Leverage Bitcoin's security model through Stacks
- **Clarity Smart Contracts**: Predictable, secure smart contracts with no reentrancy attacks
- **STX & SIP-010 Tokens**: Support for STX and fungible tokens including cNGN
- **Enterprise Treasury**: Multi-signature wallet management for organizations

## 🔄 Migration from Ethereum to Stacks

### What Changed

| Aspect | Ethereum (Before) | Stacks (After) |
|--------|------------------|----------------|
| **Blockchain** | Ethereum/Base | Stacks (Bitcoin Layer 2) |
| **Smart Contract Language** | Solidity | Clarity |
| **Native Token** | ETH | STX |
| **Token Standard** | ERC-20 | SIP-010 |
| **Wallet Integration** | ethers.js + RainbowKit | @stacks/connect |
| **Security Model** | Ethereum PoS | Bitcoin PoW + Stacks PoX |

### Key Benefits of Stacks

1. **Bitcoin Security**: Inherits Bitcoin's security through the Proof of Transfer (PoX) consensus
2. **Predictable Contracts**: Clarity prevents common smart contract vulnerabilities
3. **No Gas Wars**: More predictable transaction costs
4. **Bitcoin Integration**: Direct Bitcoin operations possible

## 📁 Project Structure

```
SecureVault-Stacks/
├── contracts/                 # Clarity smart contracts
│   ├── multisig.clar          # Core multisig wallet contract
│   ├── multisig-factory.clar  # Factory for creating wallets
│   ├── sip-010-trait.clar     # SIP-010 token trait
│   ├── cngn-stacks-token.clar # cNGN token for Stacks
│   ├── Clarinet.toml          # Clarinet configuration
│   └── settings/              # Network configurations
├── frontend/                  # Next.js frontend
│   ├── src/lib/
│   │   ├── stacksContractService.ts  # Stacks contract interactions
│   │   └── stacksConfig.ts           # Stacks configuration
│   └── package.json           # Updated with Stacks dependencies
├── scripts/                   # Deployment scripts
│   ├── deploy.js             # Contract deployment script
│   └── package.json          # Deployment dependencies
└── README-STACKS.md          # This file
```

## 🛠️ Smart Contracts

### Core Contracts

#### 1. **Multisig Contract** (`multisig.clar`)
- Multi-signature wallet functionality
- Transaction proposal and approval system
- Signer management (add/remove signers)
- Threshold management
- STX and SIP-010 token support

#### 2. **Multisig Factory** (`multisig-factory.clar`)
- Create new multisig wallets
- Organization wallet management
- Wallet enumeration and discovery

#### 3. **SIP-010 Trait** (`sip-010-trait.clar`)
- Standard interface for fungible tokens
- Compatible with all SIP-010 tokens

#### 4. **cNGN Stacks Token** (`cngn-stacks-token.clar`)
- Nigerian Naira token implementation
- Bridge functionality for cross-chain operations
- Administrative controls (pause, blacklist)

### Key Features

- ✅ **Multi-signature Security**: Require multiple approvals for transactions
- ✅ **STX Support**: Native Stacks token transfers
- ✅ **SIP-010 Tokens**: Support for all standard tokens
- ✅ **Signer Management**: Add/remove signers with proper authorization
- ✅ **Threshold Control**: Configurable approval requirements
- ✅ **Transaction History**: Complete audit trail
- ✅ **Organization Management**: Multiple wallets per organization

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Clarinet](https://github.com/hirosystems/clarinet) (for contract development)
- [Stacks Wallet](https://wallet.hiro.so/) (for testing)

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install deployment script dependencies
cd ../scripts
npm install

# Install Clarinet (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install clarinet-cli
```

### 2. Contract Development

```bash
# Check contracts
clarinet check

# Test contracts
clarinet test

# Start local devnet
clarinet integrate
```

### 3. Deploy Contracts

```bash
# Deploy to testnet
cd scripts
npm run deploy:testnet

# Deploy to mainnet (when ready)
npm run deploy:mainnet
```

### 4. Configure Frontend

Update your environment variables:

```bash
# .env.local
NEXT_PUBLIC_MULTISIG_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig
NEXT_PUBLIC_MULTISIG_FACTORY_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig-factory
NEXT_PUBLIC_CNGN_STACKS_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.cngn-stacks-token
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

## 🔧 Configuration

### Network Configuration

The application supports both Stacks testnet and mainnet:

- **Testnet**: For development and testing
- **Mainnet**: For production use

### Token Configuration

Configure supported tokens in `stacksConfig.ts`:

```typescript
TOKENS: {
  'STX': {
    symbol: 'STX',
    name: 'Stacks',
    decimals: 6,
    contractAddress: 'STX',
  },
  'cNGN': {
    symbol: 'cNGN',
    name: 'Central Bank Digital Currency - Naira',
    decimals: 6,
    contractAddress: 'YOUR_DEPLOYED_CNGN_CONTRACT',
  },
}
```

## 🧪 Testing

### Contract Testing

```bash
# Run all contract tests
clarinet test

# Check contract syntax
clarinet check

# Run specific test
clarinet test tests/multisig_test.ts
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🔐 Security Features

### Clarity Advantages

1. **No Reentrancy**: Clarity prevents reentrancy attacks by design
2. **Predictable Execution**: All contract calls are deterministic
3. **Resource Limits**: Built-in protection against infinite loops
4. **Type Safety**: Strong typing prevents many common errors

### Multi-signature Security

- Configurable threshold (M-of-N signatures)
- Signer management with proper authorization
- Transaction approval workflow
- Complete audit trail

## 🌍 Nigerian Enterprise Features

### cNGN Integration

- Native support for Nigerian Naira digital currency
- Bridge functionality for cross-chain operations
- Compliance features (pause, blacklist)
- Integration with existing cNGN infrastructure

### Enterprise Treasury

- Multi-organization support
- Role-based access control
- Bulk payment processing
- Comprehensive reporting

## 📚 API Reference

### Contract Functions

#### Multisig Contract

```clarity
;; Read-only functions
(is-signer (address principal))
(get-threshold)
(get-wallet-status)
(get-transaction (tx-id uint))

;; Public functions
(propose-transaction (to principal) (amount uint) (token-contract (optional principal)) (memo (optional (buff 34))))
(approve-transaction (tx-id uint))
(execute-transaction (tx-id uint))
```

#### Factory Contract

```clarity
;; Public functions
(create-wallet (signers (list 20 principal)) (threshold uint))
(get-org-wallets (org principal))
(get-wallet-info (wallet-address principal))
```

## 🚀 Deployment

### Testnet Deployment

1. Get testnet STX from [faucet](https://explorer.stacks.co/sandbox/faucet)
2. Configure deployer private key
3. Run deployment script

```bash
export DEPLOYER_PRIVATE_KEY="your_private_key"
npm run deploy:testnet
```

### Mainnet Deployment

1. Ensure sufficient STX for deployment fees
2. Update configuration for mainnet
3. Deploy contracts

```bash
export STACKS_NETWORK=mainnet
export DEPLOYER_PRIVATE_KEY="your_mainnet_private_key"
npm run deploy:mainnet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Stacks Documentation](https://docs.stacks.co/)
- **Clarity Language**: [Clarity Reference](https://clarity-lang.org/)
- **Community**: [Stacks Discord](https://discord.gg/stacks)

## 🙏 Acknowledgments

- **Stacks Foundation** for the Bitcoin smart contract platform
- **Hiro Systems** for development tools and infrastructure
- **cNGN Team** for Nigerian digital currency integration
- **Bitcoin Community** for the foundational security model

---

<div align="center">

**Built with ❤️ for the Bitcoin ecosystem and Nigerian enterprises**

[Website](https://securevault.example.com) • [Documentation](https://docs.securevault.example.com) • [Twitter](https://twitter.com/securevault)

</div>
