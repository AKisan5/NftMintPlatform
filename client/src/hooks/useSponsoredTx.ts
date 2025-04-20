import { useState, useCallback } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { 
  getEventSponsorConfig, 
  executeSponsoredTransaction, 
  estimateGasUsage, 
  checkSponsorEligibility 
} from '@/lib/sponsoredTx';

interface UseSponsoredTxOptions {
  eventId: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: Error) => void;
}

interface SponsoredTxState {
  isChecking: boolean;
  isEligible: boolean;
  isPreparing: boolean;
  isSigning: boolean;
  isExecuting: boolean;
  error: string | null;
  transactionId: string | null;
}

// スポンサードトランザクションを実行するためのカスタムフック
export function useSponsoredTx({ eventId, onSuccess, onError }: UseSponsoredTxOptions) {
  const wallet = useWallet();
  const { toast } = useToast();
  const [state, setState] = useState<SponsoredTxState>({
    isChecking: false,
    isEligible: false,
    isPreparing: false,
    isSigning: false,
    isExecuting: false,
    error: null,
    transactionId: null,
  });

  // スポンサード対象かどうか確認する
  const checkEligibility = useCallback(async (
    tx: Transaction
  ): Promise<boolean> => {
    try {
      setState(s => ({ ...s, isChecking: true, error: null }));

      // ガス使用量を推定
      const estimatedGas = await estimateGasUsage(tx);
      
      // スポンサー対象かどうか確認
      const { eligible, reason } = await checkSponsorEligibility(eventId, estimatedGas);
      
      setState(s => ({ 
        ...s, 
        isChecking: false, 
        isEligible: eligible,
        error: eligible ? null : reason || 'スポンサード対象外です'
      }));
      
      return eligible;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setState(s => ({ 
        ...s, 
        isChecking: false, 
        isEligible: false,
        error: errorMessage
      }));
      
      return false;
    }
  }, [eventId]);

  // スポンサードトランザクションを実行する
  const executeSponsoredTx = useCallback(async (
    tx: Transaction
  ): Promise<string | null> => {
    try {
      // リセット
      setState({
        isChecking: false,
        isEligible: false,
        isPreparing: true,
        isSigning: false,
        isExecuting: false,
        error: null,
        transactionId: null,
      });

      // スポンサー対象か確認
      const isEligible = await checkEligibility(tx);
      if (!isEligible) {
        // スポンサード対象外の場合は、通常のトランザクションとして実行
        toast({
          title: 'スポンサード対象外',
          description: state.error || 'このトランザクションはスポンサード対象外です。通常のトランザクションとして実行します。',
          variant: 'default',
        });
        
        // 通常のトランザクションを実行
        setState(s => ({ ...s, isPreparing: false, isSigning: true }));
        const result = await wallet.executeTransaction(tx);
        
        if (result) {
          setState(s => ({ 
            ...s, 
            isSigning: false, 
            transactionId: result.digest 
          }));
          
          if (onSuccess) onSuccess(result.digest);
          return result.digest;
        }
        
        throw new Error('トランザクションの実行に失敗しました');
      }

      // スポンサー設定を取得
      const sponsorConfig = await getEventSponsorConfig(eventId);
      if (!sponsorConfig) {
        throw new Error('スポンサー設定を取得できませんでした');
      }

      // ユーザー署名を取得（モック実装）
      setState(s => ({ ...s, isPreparing: false, isSigning: true }));
      
      // ウォレットで署名
      // 実際の実装では、ウォレットから署名を取得するメカニズムが必要
      // この例では簡略化のため、ダミー署名を使用
      const userSignature = new Uint8Array(64); // ダミー署名
      
      // スポンサードトランザクションを実行
      setState(s => ({ ...s, isSigning: false, isExecuting: true }));
      const result = await executeSponsoredTransaction(tx, userSignature, sponsorConfig);
      
      // 成功時の処理
      const txId = result?.digest || '';
      setState(s => ({ 
        ...s, 
        isExecuting: false, 
        transactionId: txId 
      }));
      
      toast({
        title: 'トランザクション成功',
        description: 'スポンサードトランザクションが正常に実行されました',
      });
      
      if (onSuccess) onSuccess(txId);
      return txId;
      
    } catch (error) {
      // エラー処理
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setState(s => ({ 
        ...s, 
        isPreparing: false, 
        isSigning: false, 
        isExecuting: false,
        error: errorMessage
      }));
      
      toast({
        title: 'トランザクションエラー',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (onError && error instanceof Error) onError(error);
      return null;
    }
  }, [checkEligibility, eventId, onSuccess, onError, state.error, toast, wallet]);

  return {
    ...state,
    isLoading: state.isChecking || state.isPreparing || state.isSigning || state.isExecuting,
    executeSponsoredTx,
    checkEligibility,
  };
}