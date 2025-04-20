import { 
  useWallets,
  ConnectButton, 
  ConnectModal
} from '@mysten/dapp-kit';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useWallet = () => {
  const { wallets, currentWallet } = useWallets();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // ウォレット接続状態の管理
  useEffect(() => {
    const account = currentWallet?.accounts[0];
    if (account) {
      setWalletAddress(account.address);
      setIsConnected(true);
    } else {
      setWalletAddress(null);
      setIsConnected(false);
    }
    
    if (currentWallet) {
      setIsConnecting(false);
    }
  }, [currentWallet]);

  // トランザクション実行用関数
  const executeTransaction = useCallback(async (
    target: string,
    method: string,
    args: any[] = []
  ) => {
    if (!isConnected || !currentWallet) {
      toast({
        title: 'ウォレット未接続',
        description: 'トランザクションを実行するにはウォレットを接続してください',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setIsConnecting(true);
      
      // トランザクション作成
      const tx = {
        kind: 'moveCall',
        data: {
          packageObjectId: target,
          module: 'event_manager',
          function: method,
          typeArguments: [],
          arguments: args,
          gasBudget: 10000000,
        },
      };
      
      // トランザクションを実行
      const result = await currentWallet.signAndExecuteTransaction({
        transaction: tx,
      });
      
      toast({
        title: 'トランザクション成功',
        description: `トランザクションが成功しました: ${result.digest.substring(0, 8)}...`,
      });
      
      return result;
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: 'トランザクションエラー',
        description: error.message || '不明なエラーが発生しました',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, currentAccount, signAndExecuteTransaction, toast]);

  // 接続状態、アドレス、実行関数を返す
  return {
    isConnected,
    isConnecting,
    walletAddress,
    currentAccount,
    executeTransaction,
    ConnectButton,
    ConnectModal,
  };
};