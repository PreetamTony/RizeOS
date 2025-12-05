import type { ChainType, WalletState, WalletType } from '@/types';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

// Platform fee from environment
const PLATFORM_FEE_WEI = import.meta.env.VITE_PLATFORM_FEE_WEI || '10000000000000'; // 0.00001 ETH
const PLATFORM_FEE_SOL = 0.0001; // 0.0001 SOL
const DEFAULT_CHAIN = (import.meta.env.VITE_DEFAULT_CHAIN || 'evm') as ChainType;

// Admin wallet addresses (from environment in production)
const ADMIN_WALLET_EVM = import.meta.env.VITE_ADMIN_WALLET_EVM || '0x0000000000000000000000000000000000000000';
const ADMIN_WALLET_SOLANA = import.meta.env.VITE_ADMIN_WALLET_SOLANA || '11111111111111111111111111111111'; // Replace with real admin wallet

interface UseWalletReturn extends WalletState {
  connect: (walletType: WalletType) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: (testnet: boolean) => Promise<void>;
  sendPayment: () => Promise<{ txHash: string } | null>;
  isMetaMaskInstalled: boolean;
  isPhantomInstalled: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
    };
  }
}

export const useWallet = (): UseWalletReturn => {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    chain: null,
    walletType: null,
    isTestnet: true, // Default to testnet for safety
  });

  const isMetaMaskInstalled = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
  const isPhantomInstalled = typeof window !== 'undefined' && !!window.solana?.isPhantom;

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum && state.walletType === 'metamask') {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length === 0) {
          disconnect();
        } else {
          setState(prev => ({ ...prev, address: accountsArray[0] }));
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [state.walletType]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            const balanceHex = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest'],
            }) as string;

            const balanceWei = parseInt(balanceHex, 16);
            const balanceEth = (balanceWei / 1e18).toFixed(4);

            const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
            const isTestnet = chainId !== '0x1';

            setState({
              connected: true,
              address: accounts[0],
              balance: `${balanceEth} ETH`,
              chain: 'evm',
              walletType: 'metamask',
              isTestnet,
            });
          }
        } catch (error) {
          console.error('Error checking existing connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connect = useCallback(async (walletType: WalletType): Promise<boolean> => {
    try {
      if (walletType === 'metamask') {
        if (!window.ethereum?.isMetaMask) {
          throw new Error('MetaMask is not installed');
        }

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];

        if (accounts.length > 0) {
          // Get balance
          const balanceHex = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest'],
          }) as string;

          const balanceWei = parseInt(balanceHex, 16);
          const balanceEth = (balanceWei / 1e18).toFixed(4);

          // Check network
          const chainId = await window.ethereum.request({
            method: 'eth_chainId',
          }) as string;

          // Mainnet is 0x1, testnets are others
          const isTestnet = chainId !== '0x1';

          setState({
            connected: true,
            address: accounts[0],
            balance: `${balanceEth} ETH`,
            chain: 'evm',
            walletType: 'metamask',
            isTestnet,
          });

          return true;
        }
      } else if (walletType === 'phantom') {
        if (!window.solana?.isPhantom) {
          throw new Error('Phantom is not installed');
        }

        const response = await window.solana.connect();
        const address = response.publicKey.toString();

        // Get Solana balance
        try {
          const connection = new Connection(clusterApiUrl('devnet'));
          const balanceLamports = await connection.getBalance(new PublicKey(address));
          const balanceSol = (balanceLamports / LAMPORTS_PER_SOL).toFixed(4);

          setState({
            connected: true,
            address,
            balance: `${balanceSol} SOL`,
            chain: 'solana',
            walletType: 'phantom',
            isTestnet: true, // Default to devnet
          });
        } catch (err) {
          console.error('Error fetching Solana balance:', err);
          // Fallback if connection fails
          setState({
            connected: true,
            address,
            balance: '0 SOL',
            chain: 'solana',
            walletType: 'phantom',
            isTestnet: true,
          });
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Wallet connection error:', error);
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (state.walletType === 'phantom' && window.solana) {
      window.solana.disconnect();
    }

    setState({
      connected: false,
      address: null,
      balance: null,
      chain: null,
      walletType: null,
      isTestnet: true,
    });
  }, [state.walletType]);

  const switchNetwork = useCallback(async (testnet: boolean) => {
    if (state.walletType === 'metamask' && window.ethereum) {
      try {
        const chainId = testnet ? '0xaa36a7' : '0x1'; // Sepolia or Mainnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        setState(prev => ({ ...prev, isTestnet: testnet }));
      } catch (error) {
        console.error('Network switch error:', error);
      }
    }
    // TODO: Implement Solana network switch
  }, [state.walletType]);

  const sendPayment = useCallback(async (): Promise<{ txHash: string } | null> => {
    if (!state.connected || !state.address) {
      throw new Error('Wallet not connected');
    }

    try {
      if (state.chain === 'evm' && window.ethereum) {
        // Send transaction using MetaMask
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: state.address,
            to: ADMIN_WALLET_EVM,
            value: '0x' + BigInt(PLATFORM_FEE_WEI).toString(16),
          }],
        }) as string;

        return { txHash };
      } else if (state.chain === 'solana' && window.solana) {
        const connection = new Connection(clusterApiUrl('devnet'));
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(state.address),
            toPubkey: new PublicKey(ADMIN_WALLET_SOLANA),
            lamports: LAMPORTS_PER_SOL * PLATFORM_FEE_SOL,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(state.address);

        const signed = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());

        await connection.confirmTransaction(signature);

        return { txHash: signature };
      }

      return null;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }, [state]);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    sendPayment,
    isMetaMaskInstalled,
    isPhantomInstalled,
  };
};
