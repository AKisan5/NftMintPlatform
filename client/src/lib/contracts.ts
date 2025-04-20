import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Event } from '@shared/schema';
import { suiClient } from './suiClient';

// プロジェクトアドレスと発行後のパッケージIDを設定
// これはテスト用の仮想的なIDです。実際のデプロイではこれらを実際の値に置き換える必要があります
export const CONTRACT_CONFIG = {
  PACKAGE_ID: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // 仮想的なパッケージID
  EVENT_MODULE: 'event',
  NFT_MODULE: 'nft',
  EVENT_MANAGER_ID: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', // 仮想的なイベントマネージャーID
};

/**
 * イベントを作成するトランザクションを構築
 */
export async function createEvent(
  event: Event,
  executeTransaction: (transaction: Transaction) => Promise<any>
): Promise<{ success: boolean; transactionId: string | null }> {
  try {
    // 日付をタイムスタンプ（ミリ秒）に変換
    const startDate = new Date(event.mintStartDate).getTime();
    const endDate = new Date(event.mintEndDate).getTime();

    // トランザクションオブジェクトを作成
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.EVENT_MODULE}::create_event`,
      arguments: [
        tx.object(CONTRACT_CONFIG.EVENT_MANAGER_ID), // event_manager
        tx.pure.string(event.eventName),           // name
        tx.pure.string(event.eventDetails || ''),  // details
        tx.pure.u64(startDate),                     // start_date
        tx.pure.u64(endDate),                       // end_date
        tx.pure.u64(event.mintLimit || 0),          // mint_limit (0は無制限)
        tx.pure.bool(event.gasSponsored || false),  // gas_sponsored
        tx.pure.bool(event.transferable || false),  // transferable
        tx.pure.string(event.nftName || ''),        // nft_name
        tx.pure.string(event.nftDescription || ''), // nft_description
        tx.pure.string(event.nftImageUrl || ''),    // nft_image_url
        tx.pure.string(event.passphrase),           // passphrase
      ],
    });

    // トランザクションを実行
    const result = await executeTransaction(tx);

    return {
      success: !!result,
      transactionId: result?.digest || null,
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

/**
 * 合言葉を検証する関数
 */
export async function verifyPassphrase(
  passphrase: string
): Promise<{ valid: boolean; eventId: string | null }> {
  try {
    // イベントマネージャーオブジェクトを取得
    const managerObject = await suiClient.getObject({
      id: CONTRACT_CONFIG.EVENT_MANAGER_ID,
      options: {
        showContent: true,
      },
    });

    // 合言葉で検証するクエリを実行
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: new Transaction()
        .moveCall({
          target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.EVENT_MODULE}::verify_passphrase`,
          arguments: [
            new Transaction().object(CONTRACT_CONFIG.EVENT_MANAGER_ID),
            new Transaction().pure.string(passphrase),
          ],
        }),
      sender: '0x0', // 検証のみなので任意のアドレス
    });

    // 結果を解析して合言葉が有効かどうかを判断
    const valid = result.effects?.status?.status === 'success';
    
    // 今後の拡張: 実際のイベントIDを返すロジックを追加

    return {
      valid,
      eventId: valid ? '1' : null, // ダミー実装: 実際のIDを返す必要がある
    };
  } catch (error) {
    console.error('Error verifying passphrase:', error);
    return { valid: false, eventId: null };
  }
}

/**
 * イベントNFTをミントする関数
 */
export async function mintEventNFT(
  eventId: string,
  executeTransaction: (transaction: Transaction) => Promise<any>
): Promise<{ success: boolean; transactionId: string | null }> {
  try {
    // トランザクションオブジェクトを作成
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.EVENT_MODULE}::mint_event_nft`,
      arguments: [
        tx.object(CONTRACT_CONFIG.EVENT_MANAGER_ID), // event_manager
        tx.object(eventId),                        // event_id
      ],
    });

    // トランザクションを実行
    const result = await executeTransaction(tx);

    return {
      success: !!result,
      transactionId: result?.digest || null,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}

/**
 * 合言葉でイベントを検証してからNFTをミントする関数
 */
export async function verifyAndMint(
  passphrase: string,
  executeTransaction: (transaction: Transaction) => Promise<any>
): Promise<{ success: boolean; transactionId: string | null }> {
  try {
    // トランザクションオブジェクトを作成
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.EVENT_MODULE}::verify_and_mint`,
      arguments: [
        tx.object(CONTRACT_CONFIG.EVENT_MANAGER_ID), // event_manager
        tx.pure.string(passphrase),                // passphrase
      ],
    });

    // トランザクションを実行
    const result = await executeTransaction(tx);

    return {
      success: !!result,
      transactionId: result?.digest || null,
    };
  } catch (error) {
    console.error('Error verifying and minting:', error);
    throw error;
  }
}

/**
 * イベント情報を取得する関数
 */
export async function getEventInfo(eventId: string): Promise<Event | null> {
  try {
    // イベントオブジェクトを取得
    const eventObject = await suiClient.getObject({
      id: eventId,
      options: {
        showContent: true,
      },
    });

    if (!eventObject || !eventObject.data) {
      return null;
    }

    // オブジェクトの内容からイベント情報を抽出
    // この部分は実際のオブジェクト構造に合わせて調整する必要があります
    const content = eventObject.data;
    
    // 今後のAPI実装に合わせてデータ抽出ロジックを追加

    // ダミー実装: 実際のデータ構造に合わせて変更する必要があります
    return {
      id: 1,
      eventName: "Tech Conference 2025",
      eventDetails: "最新技術のカンファレンスです。参加者には限定NFTが発行されます。",
      mintStartDate: new Date("2025/04/20 10:00"),
      mintEndDate: new Date("2025/04/30 18:00"),
      mintLimit: 100,
      gasSponsored: true,
      transferable: true,
      nftName: "Tech Conference 2025 参加証",
      nftDescription: "このNFTは2025年テクノロジーカンファレンスへの参加を証明するものです。",
      passphrase: "aikotoba"
    };
  } catch (error) {
    console.error('Error getting event info:', error);
    return null;
  }
}