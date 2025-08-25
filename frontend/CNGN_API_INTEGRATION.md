# cNGN API Integration

This document describes the integration with the official cNGN API for getting real balance information.

## Overview

The SecureVault application now integrates with the [official cNGN API](https://docs.cngn.co/integrations/endpoints/get-balance) to get real-time balance information for cNGN tokens.

## Configuration

### Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_CNGN_API_KEY=your_cngn_api_key_here
```

### Getting an API Key

1. Visit the [cNGN documentation](https://docs.cngn.co/integrations/endpoints/get-balance)
2. Follow the authentication process to get your API key
3. Add the API key to your environment variables

## API Integration

### Services

- **`cngnApiService`** - Main service for interacting with the cNGN API
- **`cngnConfig`** - Configuration constants for cNGN integration
- **`contractService`** - Updated to use cNGN API with fallback to contract balance

### Key Features

1. **Real-time Balance**: Get real-time cNGN balances from the official API
2. **Fallback Support**: Falls back to contract balance if API is unavailable
3. **Error Handling**: Graceful error handling with fallback mechanisms
4. **Configuration**: Centralized configuration management

## Usage

### Getting cNGN Balance

```typescript
import { cngnApiService } from '../lib/cngnApiService';

// Get balance from API (with fallback)
const balance = await cngnApiService.getCNGNBalanceWithFallback(walletAddress, contractService);

// Check if API is configured
const isConfigured = cngnApiService.isApiConfigured();
```

### Integration with Contract Service

The contract service automatically uses the cNGN API when available:

```typescript
import { contractService } from '../lib/contractService';

// This will automatically use cNGN API if configured, otherwise fallback to contract
const balance = await contractService.getTokenBalance(walletAddress, cngnContractAddress);
```

## API Endpoints

The integration supports the following cNGN API endpoints:

- `GET /balance` - Get wallet balance
- `GET /bank-list` - Get list of supported banks
- `GET /transaction-history` - Get transaction history
- `POST /virtual-account` - Create virtual account
- `POST /redeem-assets` - Redeem assets
- `POST /withdraw-cngn` - Withdraw cNGN
- `GET /verify-withdrawal` - Verify withdrawal
- `POST /bridge-cngn` - Bridge cNGN
- `POST /whitelist-address` - Whitelist address

## Error Handling

The integration includes comprehensive error handling:

1. **API Unavailable**: Falls back to contract balance
2. **Invalid API Key**: Logs warning and uses fallback
3. **Network Errors**: Graceful degradation to contract balance
4. **Invalid Response**: Handles malformed API responses

## Testing

### With API Key

1. Set `NEXT_PUBLIC_CNGN_API_KEY` in your environment
2. The application will use the official cNGN API
3. Check browser console for API integration logs

### Without API Key

1. Leave `NEXT_PUBLIC_CNGN_API_KEY` unset
2. The application will fall back to contract balance
3. Check browser console for fallback logs

### Testing API Connection

```typescript
import { cngnApiService } from '../lib/cngnApiService';

// Test if API is working
const isWorking = await cngnApiService.testApiConnection();
console.log('cNGN API working:', isWorking);
```

## Security

- API keys are stored in environment variables
- No sensitive data is logged to console
- All API requests use HTTPS
- Fallback mechanisms ensure functionality even if API is unavailable

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if the key has the required permissions
   - Ensure the key is properly formatted

2. **Balance Not Updating**
   - Check if API is configured
   - Verify network connectivity
   - Check browser console for errors

3. **Fallback Not Working**
   - Verify contract address is correct
   - Check if wallet is connected
   - Ensure contract is deployed on the correct network

### Debug Mode

Enable debug logging by checking the browser console for:
- API integration logs
- Fallback mechanism logs
- Error messages and warnings 