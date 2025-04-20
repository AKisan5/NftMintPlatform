import { apiRequest } from './queryClient';
import { suiClient } from './suiClient';
import { Transaction } from '@mysten/sui/transactions';

/**
 * ガスステーション管理システム
 * イベント主催者がガスを提供し、参加者のトランザクションをサポートする機能
 */

// ガスステーションの状態
export interface GasStationState {
  availableBalance: bigint;    // 利用可能なガス残高（SUI単位）
  allocatedBalance: bigint;    // イベントに割り当て済みのガス（SUI単位）
  totalUsed: bigint;           // これまでに使用されたガス量（SUI単位）
  lastUpdated: Date;           // 最終更新日時
  isActive: boolean;           // アクティブかどうか
}

// イベントのガス割り当て
export interface EventGasAllocation {
  eventId: string;            // イベントID
  maxGasPerTx: bigint;        // トランザクションあたりの最大ガス
  totalAllocated: bigint;     // イベントへの総割り当て量
  used: bigint;               // 使用済みガス量
  remainingAllocation: bigint; // 残りの割り当て量
  transactions: number;       // これまでの処理トランザクション数
  isActive: boolean;          // 割り当てがアクティブかどうか
}

/**
 * ガスステーションの状態を取得
 * @returns ガスステーションの状態
 */
export async function getGasStationState(): Promise<GasStationState> {
  try {
    // APIからガスステーションの状態を取得
    const response = await apiRequest('GET', '/api/gas-station/state');
    const data = await response.json();
    
    // BigIntに変換
    return {
      availableBalance: BigInt(data.availableBalance),
      allocatedBalance: BigInt(data.allocatedBalance),
      totalUsed: BigInt(data.totalUsed),
      lastUpdated: new Date(data.lastUpdated),
      isActive: data.isActive
    };
  } catch (error) {
    console.error('Failed to get gas station state:', error);
    
    // デモ用のダミーデータを返す
    return {
      availableBalance: BigInt(100000000000), // 100 SUI
      allocatedBalance: BigInt(50000000000),  // 50 SUI
      totalUsed: BigInt(10000000000),         // 10 SUI
      lastUpdated: new Date(),
      isActive: true
    };
  }
}

/**
 * イベントのガス割り当てを取得
 * @param eventId イベントID
 * @returns イベントのガス割り当て
 */
export async function getEventGasAllocation(eventId: string): Promise<EventGasAllocation> {
  try {
    // APIからイベントのガス割り当てを取得
    const response = await apiRequest('GET', `/api/gas-station/events/${eventId}`);
    const data = await response.json();
    
    // BigIntに変換
    return {
      eventId: data.eventId,
      maxGasPerTx: BigInt(data.maxGasPerTx),
      totalAllocated: BigInt(data.totalAllocated),
      used: BigInt(data.used),
      remainingAllocation: BigInt(data.remainingAllocation),
      transactions: data.transactions,
      isActive: data.isActive
    };
  } catch (error) {
    console.error(`Failed to get gas allocation for event ${eventId}:`, error);
    
    // デモ用のダミーデータを返す
    return {
      eventId,
      maxGasPerTx: BigInt(20000000000), // 20 SUI
      totalAllocated: BigInt(50000000000), // 50 SUI
      used: BigInt(5000000000), // 5 SUI
      remainingAllocation: BigInt(45000000000), // 45 SUI
      transactions: 10,
      isActive: true
    };
  }
}

/**
 * イベントにガスを割り当て
 * @param eventId イベントID
 * @param amount 割り当てるガス量
 * @param maxPerTx トランザクションあたりの最大ガス
 * @returns 更新されたガス割り当て
 */
export async function allocateGasToEvent(
  eventId: string,
  amount: bigint,
  maxPerTx: bigint
): Promise<EventGasAllocation> {
  try {
    // APIを使用してイベントにガスを割り当て
    const response = await apiRequest('POST', '/api/gas-station/allocate', {
      eventId,
      amount: amount.toString(),
      maxPerTx: maxPerTx.toString()
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to allocate gas to event ${eventId}:`, error);
    throw error;
  }
}

/**
 * トランザクションのガス使用を記録
 * @param eventId イベントID
 * @param txId トランザクションID
 * @param gasUsed 使用したガス量
 * @returns 更新されたガス割り当て
 */
export async function recordGasUsage(
  eventId: string,
  txId: string,
  gasUsed: bigint
): Promise<EventGasAllocation> {
  try {
    // APIを使用してガス使用を記録
    const response = await apiRequest('POST', '/api/gas-station/record-usage', {
      eventId,
      txId,
      gasUsed: gasUsed.toString()
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to record gas usage for event ${eventId}:`, error);
    throw error;
  }
}

/**
 * トランザクションがスポンサー対象かどうかを確認
 * @param eventId イベントID
 * @param estimatedGas 推定ガス使用量
 * @returns スポンサー対象かどうか
 */
export async function checkSponsorEligibility(
  eventId: string,
  estimatedGas: bigint
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    // イベントのガス割り当てを取得
    const allocation = await getEventGasAllocation(eventId);
    
    // スポンサー対象かどうかをチェック
    if (!allocation.isActive) {
      return { eligible: false, reason: 'イベントのガススポンサー機能が無効です' };
    }
    
    if (estimatedGas > allocation.maxGasPerTx) {
      return { 
        eligible: false, 
        reason: `トランザクションのガス使用量が上限を超えています (${estimatedGas} > ${allocation.maxGasPerTx})` 
      };
    }
    
    if (estimatedGas > allocation.remainingAllocation) {
      return { 
        eligible: false, 
        reason: 'イベントの残りガス割り当てが不足しています' 
      };
    }
    
    return { eligible: true };
  } catch (error) {
    console.error(`Failed to check sponsor eligibility for event ${eventId}:`, error);
    return { eligible: false, reason: 'ガスステーションの確認中にエラーが発生しました' };
  }
}

/**
 * ガスステーションの残高を追加（管理者向け）
 * @param amount 追加する金額（SUI単位）
 * @returns 更新されたガスステーションの状態
 */
export async function addGasStationBalance(amount: bigint): Promise<GasStationState> {
  try {
    // APIを使用してガスステーションの残高を追加
    const response = await apiRequest('POST', '/api/gas-station/add-balance', {
      amount: amount.toString()
    });
    
    const data = await response.json();
    
    // BigIntに変換
    return {
      availableBalance: BigInt(data.availableBalance),
      allocatedBalance: BigInt(data.allocatedBalance),
      totalUsed: BigInt(data.totalUsed),
      lastUpdated: new Date(data.lastUpdated),
      isActive: data.isActive
    };
  } catch (error) {
    console.error('Failed to add balance to gas station:', error);
    throw error;
  }
}