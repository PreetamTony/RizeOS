import { Connection } from '@solana/web3.js';
import { ethers } from 'ethers';

// Admin wallets
const ADMIN_WALLET_EVM = process.env.ADMIN_WALLET_EVM || '0x0000000000000000000000000000000000000000';
const ADMIN_WALLET_SOLANA = process.env.ADMIN_WALLET_SOLANA || '11111111111111111111111111111111';

// Platform fee
const PLATFORM_FEE_WEI = process.env.PLATFORM_FEE_WEI || '10000000000000'; // 0.00001 ETH
const PLATFORM_FEE_SOL = 0.0001; // 0.0001 SOL
const LAMPORTS_PER_SOL = 1000000000;

// Providers
// Use public RPCs for dev if not provided
const EVM_RPC_URL = process.env.EVM_RPC_URL || 'https://rpc.ankr.com/eth_goerli'; // Default to Goerli
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const verifyPayment = async (req, res) => {
    console.log('Verify payment request:', req.body);
    try {
        const { txHash, chain } = req.body;

        if (!txHash || !chain) {
            return res.status(400).json({
                success: false,
                message: 'Transaction hash and chain are required'
            });
        }

        // Bypass for development/testing
        if (process.env.NODE_ENV === 'development' && txHash.startsWith('mock_')) {
            console.log('Mock payment verified:', txHash);
            return res.status(200).json({
                success: true,
                data: {
                    status: 'verified',
                    txHash,
                    chain,
                    amount: PLATFORM_FEE_WEI,
                    sender: 'mock_sender'
                }
            });
        }

        if (chain === 'evm') {
            try {
                const provider = new ethers.JsonRpcProvider(EVM_RPC_URL);
                const tx = await provider.getTransaction(txHash);

                if (!tx) {
                    return res.status(404).json({
                        success: false,
                        message: 'Transaction not found'
                    });
                }

                // Verify recipient
                if (tx.to.toLowerCase() !== ADMIN_WALLET_EVM.toLowerCase()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid recipient'
                    });
                }

                // Verify amount
                // Allow small margin of error or exact match? Exact match for now.
                // Note: tx.value is BigInt in ethers v6
                if (tx.value.toString() !== PLATFORM_FEE_WEI) {
                    // Check if it's greater or equal, maybe?
                    if (BigInt(tx.value) < BigInt(PLATFORM_FEE_WEI)) {
                        return res.status(400).json({
                            success: false,
                            message: 'Insufficient payment amount'
                        });
                    }
                }

                // Verify confirmations
                const receipt = await provider.getTransactionReceipt(txHash);
                if (!receipt || receipt.status !== 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Transaction failed or not confirmed'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        status: 'verified',
                        txHash,
                        chain,
                        amount: tx.value.toString(),
                        sender: tx.from
                    }
                });

            } catch (error) {
                console.error('EVM verification error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to verify EVM transaction',
                    error: error.message
                });
            }
        } else if (chain === 'solana') {
            try {
                const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
                const tx = await connection.getParsedTransaction(txHash, {
                    maxSupportedTransactionVersion: 0
                });

                if (!tx) {
                    return res.status(404).json({
                        success: false,
                        message: 'Transaction not found'
                    });
                }

                // Check for error
                if (tx.meta.err) {
                    return res.status(400).json({
                        success: false,
                        message: 'Transaction failed'
                    });
                }

                // Find transfer instruction to admin wallet
                const instructions = tx.transaction.message.instructions;
                let validTransfer = false;
                let amount = 0;
                let sender = '';

                // Handle parsed instructions
                // This is simplified; in production need to handle inner instructions and different program types
                // Assuming simple SystemProgram transfer

                // We need to look at pre/post balances or parsed instructions
                // Let's look at account keys to find sender and receiver
                const accountKeys = tx.transaction.message.accountKeys;
                const adminPubkey = ADMIN_WALLET_SOLANA;

                // Check pre/post balances for admin wallet
                const adminIndex = accountKeys.findIndex(k => k.pubkey.toString() === adminPubkey);

                if (adminIndex !== -1) {
                    const preBalance = tx.meta.preBalances[adminIndex];
                    const postBalance = tx.meta.postBalances[adminIndex];
                    const diff = postBalance - preBalance;

                    // Check if received amount is sufficient
                    if (diff >= PLATFORM_FEE_SOL * LAMPORTS_PER_SOL) {
                        validTransfer = true;
                        amount = diff;
                        sender = accountKeys[0].pubkey.toString(); // Fee payer is usually first
                    }
                }

                if (!validTransfer) {
                    return res.status(400).json({
                        success: false,
                        message: 'Valid payment to admin wallet not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: {
                        status: 'verified',
                        txHash,
                        chain,
                        amount: amount.toString(),
                        sender
                    }
                });

            } catch (error) {
                console.error('Solana verification error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to verify Solana transaction',
                    error: error.message
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid chain type'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
