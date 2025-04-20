import { 
  useCurrentAccount,
  useCurrentWallet,
  ConnectButton, 
  ConnectModal
} from '@mysten/dapp-kit';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@mysten/sui/transactions';

export const useWallet = () => {
  const currentAccount = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // ウォレット接続状態の管理
  useEffect(() => {
    if (currentAccount) {
      setWalletAddress(currentAccount.address);
      setIsConnected(true);
    } else {
      setWalletAddress(null);
      setIsConnected(false);
    }
    
    setIsConnecting(false);
  }, [currentAccount]);

  // トランザクション実行用関数
  const executeTransaction = useCallback(async (tx: Transaction) => {
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
      
      // トランザクションを実行
      const result = await currentWallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
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
  }, [isConnected, currentWallet, toast]);

  // 接続状態、アドレス、実行関数を返す
  return {
    isConnected,
    isConnecting,
    walletAddress,
    account: currentAccount,
    executeTransaction,
    ConnectButton,
    ConnectModal,
  };
};