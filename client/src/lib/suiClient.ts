import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

// テストネットの RPC エンドポイントを使用
export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// ネットワークを切り替えるための関数
export enum SuiNetwork {
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  MAINNET = 'mainnet',
}

export function getSuiClient(network: SuiNetwork = SuiNetwork.TESTNET): SuiClient {
  return new SuiClient({
    url: getFullnodeUrl(network),
  });
}