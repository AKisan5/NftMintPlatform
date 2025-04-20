import { suiClient } from './suiClient';
import { Transaction } from '@mysten/sui/transactions';
import { Event } from '@shared/schema';
import { 
  createEvent, 
  mintEventNFT as mintNFT, 
  verifyPassphrase, 
  getEventInfo 
} from './contracts';

// イベントをオンチェーンに登録する関数
export async function registerEventOnChain(
  senderAddress: string,
  event: Event,
  executeTransaction: (transaction: Transaction) => Promise<any>
) {
  try {
    // コントラクトモジュールを使用してイベントを作成
    const result = await createEvent(event, executeTransaction);

    return {
      success: result.success,
      transactionId: result.transactionId,
      eventId: event.id
    };
  } catch (error) {
    console.error('Error registering event on chain:', error);
    throw error;
  }
}

// イベントIDからオンチェーンのイベント情報を取得
export async function getEventFromChain(eventId: string) {
  try {
    // コントラクトから最新のイベント情報を取得
    return await getEventInfo(eventId);
  } catch (error) {
    console.error('Error getting event from chain:', error);
    throw error;
  }
}

// 合言葉を検証する関数
export async function verifyEventPassphrase(passphrase: string) {
  try {
    return await verifyPassphrase(passphrase);
  } catch (error) {
    console.error('Error verifying passphrase:', error);
    throw error;
  }
}

// NFTをミントするトランザクションを作成
export async function mintEventNFT(
  eventId: string,
  walletAddress: string,
  executeTransaction: ((transaction: Transaction) => Promise<any>) | null,
  createOnly: boolean = false
) {
  try {
    // スポンサートランザクション用のトランザクション作成モード
    if (createOnly && !executeTransaction) {
      // トランザクションを作成するが実行しない
      const tx = await mintNFT(eventId, null, true); // トランザクション作成のみ
      return tx; // トランザクションオブジェクトを返す
    }
    
    // 通常のトランザクション実行モード
    if (executeTransaction) {
      const result = await mintNFT(eventId, executeTransaction);
      return {
        success: result.success,
        transactionId: result.transactionId,
      };
    }
    
    throw new Error('executeTransaction が必要です');
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}