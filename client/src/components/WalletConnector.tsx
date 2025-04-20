import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { truncateString } from '@/lib/utils';

interface WalletConnectorProps {
  className?: string;
  onWalletConnected?: (address: string) => void;
}

export default function WalletConnector({ className, onWalletConnected }: WalletConnectorProps) {
  const { 
    isConnected, 
    isConnecting, 
    walletAddress, 
    ConnectButton 
  } = useWallet();

  // ウォレット接続状態が変わったらコールバックを呼び出す
  React.useEffect(() => {
    if (isConnected && walletAddress && onWalletConnected) {
      onWalletConnected(walletAddress);
    }
  }, [isConnected, walletAddress, onWalletConnected]);

  return (
    <div className={className}>
      <Card className="p-4">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-medium">Sui ウォレット</h3>
          
          {isConnected && walletAddress ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium mb-2">
                接続済み
              </div>
              <p className="text-sm text-gray-500">
                ウォレットアドレス: {truncateString(walletAddress)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ConnectButton className="w-full py-2 px-4 bg-primary text-white rounded">
                {isConnecting ? "接続中..." : "ウォレットを接続"}
              </ConnectButton>
              <p className="text-xs text-gray-500 mt-2">
                Sui ブロックチェーンとのやり取りにはウォレットの接続が必要です
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}