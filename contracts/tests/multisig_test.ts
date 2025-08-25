import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Multisig: Initialize wallet with signers and threshold",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('multisig', 'initialize', [
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address),
                    types.principal(wallet3.address)
                ]),
                types.uint(2)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result.expectOk(), true);
        
        // Check if signers were added correctly
        let getSignerCount = chain.callReadOnlyFn('multisig', 'get-signer-count', [], deployer.address);
        assertEquals(getSignerCount.result.expectUint(), 3);
        
        // Check threshold
        let getThreshold = chain.callReadOnlyFn('multisig', 'get-threshold', [], deployer.address);
        assertEquals(getThreshold.result.expectUint(), 2);
        
        // Check if addresses are signers
        let isSigner1 = chain.callReadOnlyFn('multisig', 'is-signer', [types.principal(wallet1.address)], deployer.address);
        assertEquals(isSigner1.result.expectBool(), true);
        
        let isSigner2 = chain.callReadOnlyFn('multisig', 'is-signer', [types.principal(wallet2.address)], deployer.address);
        assertEquals(isSigner2.result.expectBool(), true);
        
        let isSigner3 = chain.callReadOnlyFn('multisig', 'is-signer', [types.principal(wallet3.address)], deployer.address);
        assertEquals(isSigner3.result.expectBool(), true);
    },
});

Clarinet.test({
    name: "Multisig: Propose and approve transaction",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        
        // Initialize multisig
        let initBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'initialize', [
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address),
                    types.principal(wallet3.address)
                ]),
                types.uint(2)
            ], deployer.address)
        ]);
        
        assertEquals(initBlock.receipts[0].result.expectOk(), true);
        
        // Propose a transaction
        let proposeBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'propose-transaction', [
                types.principal(deployer.address),
                types.uint(1000000), // 1 STX
                types.none(),
                types.none()
            ], wallet1.address)
        ]);
        
        assertEquals(proposeBlock.receipts.length, 1);
        assertEquals(proposeBlock.receipts[0].result.expectOk(), 0); // Transaction ID 0
        
        // Check transaction details
        let getTx = chain.callReadOnlyFn('multisig', 'get-transaction', [types.uint(0)], deployer.address);
        let txData = getTx.result.expectSome().expectTuple();
        assertEquals(txData['to'], deployer.address);
        assertEquals(txData['amount'], types.uint(1000000));
        assertEquals(txData['executed'], types.bool(false));
        assertEquals(txData['approval-count'], types.uint(0));
        
        // Approve transaction from wallet1
        let approve1Block = chain.mineBlock([
            Tx.contractCall('multisig', 'approve-transaction', [
                types.uint(0)
            ], wallet1.address)
        ]);
        
        assertEquals(approve1Block.receipts[0].result.expectOk(), true);
        
        // Check approval count
        let getTxAfterApproval1 = chain.callReadOnlyFn('multisig', 'get-transaction', [types.uint(0)], deployer.address);
        let txDataAfterApproval1 = getTxAfterApproval1.result.expectSome().expectTuple();
        assertEquals(txDataAfterApproval1['approval-count'], types.uint(1));
        
        // Approve transaction from wallet2 (should reach threshold)
        let approve2Block = chain.mineBlock([
            Tx.contractCall('multisig', 'approve-transaction', [
                types.uint(0)
            ], wallet2.address)
        ]);
        
        assertEquals(approve2Block.receipts[0].result.expectOk(), true);
        
        // Check approval count
        let getTxAfterApproval2 = chain.callReadOnlyFn('multisig', 'get-transaction', [types.uint(0)], deployer.address);
        let txDataAfterApproval2 = getTxAfterApproval2.result.expectSome().expectTuple();
        assertEquals(txDataAfterApproval2['approval-count'], types.uint(2));
    },
});

Clarinet.test({
    name: "Multisig: Execute transaction after sufficient approvals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        const wallet3 = accounts.get('wallet_3')!;
        
        // Initialize multisig
        let initBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'initialize', [
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address),
                    types.principal(wallet3.address)
                ]),
                types.uint(2)
            ], deployer.address)
        ]);
        
        // Propose transaction
        let proposeBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'propose-transaction', [
                types.principal(deployer.address),
                types.uint(1000000),
                types.none(),
                types.none()
            ], wallet1.address)
        ]);
        
        // Get approvals
        let approveBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'approve-transaction', [types.uint(0)], wallet1.address),
            Tx.contractCall('multisig', 'approve-transaction', [types.uint(0)], wallet2.address)
        ]);
        
        // Execute transaction
        let executeBlock = chain.mineBlock([
            Tx.contractCall('multisig', 'execute-stx-transaction', [
                types.uint(0)
            ], wallet1.address)
        ]);
        
        assertEquals(executeBlock.receipts[0].result.expectOk(), true);
        
        // Check transaction is marked as executed
        let getTx = chain.callReadOnlyFn('multisig', 'get-transaction', [types.uint(0)], deployer.address);
        let txData = getTx.result.expectSome().expectTuple();
        assertEquals(txData['executed'], types.bool(true));
    },
});

Clarinet.test({
    name: "Factory: Create new multisig wallet",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('multisig-factory', 'create-wallet', [
                types.list([
                    types.principal(wallet1.address),
                    types.principal(wallet2.address)
                ]),
                types.uint(2)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
        
        // Check wallet count
        let getWalletCount = chain.callReadOnlyFn('multisig-factory', 'get-wallet-count', [], deployer.address);
        assertEquals(getWalletCount.result.expectUint(), 1);
        
        // Check org wallets
        let getOrgWallets = chain.callReadOnlyFn('multisig-factory', 'get-org-wallets', [types.principal(deployer.address)], deployer.address);
        let orgWallets = getOrgWallets.result.expectList();
        assertEquals(orgWallets.length, 1);
    },
});

Clarinet.test({
    name: "SIP-010 Token: Basic token operations",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Initialize token
        let initBlock = chain.mineBlock([
            Tx.contractCall('cngn-stacks-token', 'mint', [
                types.uint(1000000),
                types.principal(deployer.address)
            ], deployer.address)
        ]);
        
        assertEquals(initBlock.receipts[0].result.expectOk(), true);
        
        // Check balance
        let getBalance = chain.callReadOnlyFn('cngn-stacks-token', 'get-balance', [types.principal(deployer.address)], deployer.address);
        assertEquals(getBalance.result.expectOk().expectUint(), 1000000);
        
        // Transfer tokens
        let transferBlock = chain.mineBlock([
            Tx.contractCall('cngn-stacks-token', 'transfer', [
                types.uint(500000),
                types.principal(deployer.address),
                types.principal(wallet1.address),
                types.none()
            ], deployer.address)
        ]);
        
        assertEquals(transferBlock.receipts[0].result.expectOk(), true);
        
        // Check balances after transfer
        let getBalanceDeployer = chain.callReadOnlyFn('cngn-stacks-token', 'get-balance', [types.principal(deployer.address)], deployer.address);
        assertEquals(getBalanceDeployer.result.expectOk().expectUint(), 500000);
        
        let getBalanceWallet1 = chain.callReadOnlyFn('cngn-stacks-token', 'get-balance', [types.principal(wallet1.address)], deployer.address);
        assertEquals(getBalanceWallet1.result.expectOk().expectUint(), 500000);
    },
});
