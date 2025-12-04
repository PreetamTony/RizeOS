import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Wallet, AlertCircle, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

const ConnectWallet: React.FC = () => {
  const { 
    connected, 
    address, 
    balance, 
    chain, 
    isTestnet,
    connect, 
    disconnect,
    switchNetwork,
    isMetaMaskInstalled,
    isPhantomInstalled 
  } = useWallet();
  const navigate = useNavigate();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Briefcase className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold font-display gradient-text">
            JobMate
          </span>
        </Link>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display">
              {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
            </CardTitle>
            <CardDescription>
              {connected 
                ? 'Your wallet is connected and ready for transactions' 
                : 'Connect your crypto wallet to post jobs and make payments'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {connected && address ? (
              /* Connected State */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Connected Successfully</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">Address</span>
                    <span className="font-mono text-sm">{truncateAddress(address)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">Balance</span>
                    <span className="font-semibold">{balance || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={isTestnet ? 'warning' : 'success'}>
                        {isTestnet ? 'Testnet' : 'Mainnet'}
                      </Badge>
                      <span className="text-sm capitalize">{chain}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => switchNetwork(!isTestnet)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Switch to {isTestnet ? 'Mainnet' : 'Testnet'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => navigate('/post-job')}
                >
                  Continue to Post a Job
                </Button>
              </div>
            ) : (
              /* Disconnected State */
              <div className="space-y-4">
                {/* MetaMask */}
                <button
                  onClick={() => connect('metamask')}
                  disabled={!isMetaMaskInstalled}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4",
                    isMetaMaskInstalled
                      ? "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                      : "border-border/50 bg-muted/50 cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(38,100%,50%)] to-[hsl(25,100%,50%)] flex items-center justify-center">
                    <svg className="w-7 h-7" viewBox="0 0 35 33" fill="none">
                      <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" fill="#E17726"/>
                      <path d="M2.04858 1L15.0707 10.8237L12.7337 4.99099L2.04858 1Z" fill="#E27625"/>
                      <path d="M28.2292 23.5334L24.7346 29.0334L32.2346 31.1L34.4292 23.6667L28.2292 23.5334Z" fill="#E27625"/>
                      <path d="M0.583374 23.6667L2.76671 31.1L10.2667 29.0334L6.77171 23.5334L0.583374 23.6667Z" fill="#E27625"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-sm text-muted-foreground">
                      {isMetaMaskInstalled ? 'Connect to your MetaMask wallet' : 'MetaMask not installed'}
                    </div>
                  </div>
                  {!isMetaMaskInstalled && (
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Install <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </button>

                {/* Phantom */}
                <button
                  onClick={() => connect('phantom')}
                  disabled={!isPhantomInstalled}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4",
                    isPhantomInstalled
                      ? "border-border hover:border-accent hover:bg-accent/5 cursor-pointer"
                      : "border-border/50 bg-muted/50 cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(270,80%,60%)] to-[hsl(280,80%,50%)] flex items-center justify-center">
                    <svg className="w-7 h-7" viewBox="0 0 128 128" fill="white">
                      <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm29.3 74.7c-3.4 16.4-18.4 27.5-35.8 27.5-19.9 0-36-16.1-36-36s16.1-36 36-36c9.9 0 19 4 25.5 11.2l-10.3 9.8c-4-4.4-9.7-6.9-15.8-6.9-12.1 0-21.9 9.8-21.9 21.9s9.8 21.9 21.9 21.9c10.3 0 18.9-7.1 21.2-16.6H64V59.4h35.4c.4 2.1.6 4.3.6 6.5 0 3-.4 5.9-1.1 8.8h-.6z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Phantom</div>
                    <div className="text-sm text-muted-foreground">
                      {isPhantomInstalled ? 'Connect to your Phantom wallet' : 'Phantom not installed'}
                    </div>
                  </div>
                  {!isPhantomInstalled && (
                    <a 
                      href="https://phantom.app/download" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Install <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </button>

                {/* Info */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Why connect a wallet?</p>
                      <p>
                        Posting jobs requires a small platform fee paid via blockchain. 
                        We support Ethereum and Solana testnets for development.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
