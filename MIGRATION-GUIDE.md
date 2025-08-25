# 🔄 Migration Guide: Ethereum to Stacks

This guide walks you through the complete migration from Ethereum/Solidity to Stacks/Clarity for the SecureVault project.

## 📋 Migration Checklist

### ✅ Completed

- [x] **Smart Contracts Converted**
  - [x] Multisig contract (`multisig.clar`)
  - [x] Multisig Factory contract (`multisig-factory.clar`)
  - [x] SIP-010 trait definition (`sip-010-trait.clar`)
  - [x] cNGN token implementation (`cngn-stacks-token.clar`)

- [x] **Frontend Updated**
  - [x] Replaced ethers.js with @stacks/connect
  - [x] Created Stacks contract service
  - [x] Updated package.json dependencies
  - [x] Created Stacks configuration

- [x] **Deployment Infrastructure**
  - [x] Clarinet configuration
  - [x] Deployment scripts
  - [x] Network configurations
  - [x] Test suite

### 🔄 Next Steps

- [ ] **Install Dependencies**
- [ ] **Test Contracts**
- [ ] **Deploy to Testnet**
- [ ] **Update Frontend Configuration**
- [ ] **Integration Testing**
- [ ] **Production Deployment**

## 🚀 Step-by-Step Migration

### Step 1: Install Required Tools

```bash
# Install Clarinet (Stacks development tool)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install clarinet-cli

# Verify installation
clarinet --version
```

### Step 2: Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Deployment script dependencies
cd ../scripts
npm install
```

### Step 3: Test Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Check contract syntax
clarinet check

# Run tests
clarinet test

# Start local devnet for testing
clarinet integrate
```

### Step 4: Deploy to Testnet

```bash
# Get testnet STX from faucet
# Visit: https://explorer.stacks.co/sandbox/faucet

# Set up environment
export DEPLOYER_PRIVATE_KEY="your_testnet_private_key"
export STACKS_NETWORK="testnet"

# Deploy contracts
cd scripts
npm run deploy:testnet
```

### Step 5: Update Frontend Configuration

After successful deployment, update your environment variables:

```bash
# Create .env.local in frontend directory
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_MULTISIG_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig
NEXT_PUBLIC_MULTISIG_FACTORY_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multisig-factory
NEXT_PUBLIC_SIP010_TRAIT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait
NEXT_PUBLIC_CNGN_STACKS_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.cngn-stacks-token
EOF
```

### Step 6: Test Frontend Integration

```bash
# Start development server
npm run dev

# Test wallet connection with Stacks wallet
# Test contract interactions
# Verify transaction flows
```

## 🔍 Key Differences

### Smart Contract Language

| Solidity | Clarity |
|----------|---------|
| `contract MyContract { }` | `(define-public (function-name ...)` |
| `mapping(address => uint)` | `(define-map map-name principal uint)` |
| `require(condition, "error")` | `(asserts! condition ERR-CODE)` |
| `msg.sender` | `tx-sender` |
| `address(0)` | `'SP000000000000000000002Q6VF78` |

### Frontend Integration

| Ethereum | Stacks |
|----------|--------|
| `ethers.js` | `@stacks/connect` |
| `useAccount()` from wagmi | `userSession.isUserSignedIn()` |
| `writeContract()` | `openContractCall()` |
| `readContract()` | `callReadOnlyFunction()` |

### Token Standards

| Ethereum | Stacks |
|----------|--------|
| ERC-20 | SIP-010 |
| `transfer(to, amount)` | `transfer(amount, from, to, memo)` |
| `balanceOf(account)` | `get-balance(account)` |
| `totalSupply()` | `get-total-supply()` |

## 🧪 Testing Strategy

### 1. Contract Testing

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/multisig_test.ts

# Check contract coverage
clarinet test --coverage
```

### 2. Integration Testing

```bash
# Start local devnet
clarinet integrate

# In another terminal, test frontend
cd frontend
npm run dev

# Test complete user flows:
# - Wallet connection
# - Multisig creation
# - Transaction proposal
# - Transaction approval
# - Transaction execution
```

### 3. Testnet Testing

1. Deploy contracts to testnet
2. Update frontend configuration
3. Test with real Stacks wallet
4. Verify all functionality works

## 🔧 Configuration Updates

### Network Configuration

Update `stacksConfig.ts` with your deployed contract addresses:

```typescript
export const STACKS_CONFIG = {
  CONTRACTS: {
    MULTISIG: 'YOUR_DEPLOYED_MULTISIG_ADDRESS',
    MULTISIG_FACTORY: 'YOUR_DEPLOYED_FACTORY_ADDRESS',
    // ... other contracts
  },
  // ... rest of config
};
```

### Token Configuration

Add supported tokens:

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
    contractAddress: 'YOUR_CNGN_CONTRACT_ADDRESS',
  },
}
```

## 🚨 Common Issues & Solutions

### Issue 1: Contract Deployment Fails

**Problem**: Contract deployment returns an error

**Solution**:
- Check contract syntax with `clarinet check`
- Ensure sufficient STX balance for deployment
- Verify network configuration
- Check for dependency issues

### Issue 2: Frontend Can't Connect to Contracts

**Problem**: Contract calls fail in frontend

**Solution**:
- Verify contract addresses in configuration
- Check network settings (testnet vs mainnet)
- Ensure Stacks wallet is connected
- Verify function names match contract

### Issue 3: Token Transfers Fail

**Problem**: SIP-010 token transfers don't work

**Solution**:
- Check token contract implements SIP-010 trait correctly
- Verify sufficient token balance
- Check for contract paused state
- Verify recipient address format

## 📊 Performance Considerations

### Transaction Costs

| Operation | Estimated Cost (STX) |
|-----------|---------------------|
| Contract Deployment | 0.01 - 0.1 |
| Create Multisig | 0.001 - 0.01 |
| Propose Transaction | 0.001 - 0.005 |
| Approve Transaction | 0.001 - 0.005 |
| Execute Transaction | 0.001 - 0.01 |

### Optimization Tips

1. **Batch Operations**: Group multiple approvals in single block
2. **Efficient Data Structures**: Use maps for O(1) lookups
3. **Minimize Contract Calls**: Cache read-only data in frontend
4. **Use Post-Conditions**: Add safety checks for transfers

## 🔐 Security Considerations

### Clarity Advantages

1. **No Reentrancy**: Clarity prevents reentrancy attacks by design
2. **Predictable Execution**: All operations are deterministic
3. **Type Safety**: Strong typing prevents many errors
4. **Resource Limits**: Built-in protection against infinite loops

### Best Practices

1. **Input Validation**: Always validate inputs with `asserts!`
2. **Access Control**: Use proper authorization checks
3. **Error Handling**: Define clear error codes
4. **Testing**: Comprehensive test coverage

## 📈 Monitoring & Maintenance

### Monitoring Tools

- **Stacks Explorer**: https://explorer.stacks.co/
- **Hiro API**: Monitor contract interactions
- **Custom Dashboards**: Track multisig usage

### Maintenance Tasks

1. **Regular Testing**: Run tests on new Stacks versions
2. **Security Updates**: Monitor for security advisories
3. **Performance Monitoring**: Track transaction costs
4. **User Feedback**: Collect and address user issues

## 🎯 Success Metrics

### Technical Metrics

- [ ] All contracts deploy successfully
- [ ] All tests pass
- [ ] Frontend connects to contracts
- [ ] Transactions execute correctly
- [ ] Error handling works properly

### User Experience Metrics

- [ ] Wallet connection is smooth
- [ ] Transaction flows are intuitive
- [ ] Loading times are acceptable
- [ ] Error messages are clear
- [ ] Mobile experience works well

## 📞 Support & Resources

### Documentation

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://clarity-lang.org/)
- [SIP-010 Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)

### Community

- [Stacks Discord](https://discord.gg/stacks)
- [Stacks Forum](https://forum.stacks.org/)
- [GitHub Issues](https://github.com/your-repo/issues)

### Professional Support

- Stacks Foundation grants
- Hiro developer support
- Community developer network

---

**🎉 Congratulations!** You've successfully migrated from Ethereum to Stacks. Your SecureVault application now runs on Bitcoin smart contracts with enhanced security and predictability.
