import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  GasStationState, 
  EventGasAllocation, 
  getGasStationState, 
  getEventGasAllocation,
  allocateGasToEvent,
  addGasStationBalance 
} from '@/lib/gasStation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BadgeDelta } from '@/components/ui/badge-delta';
import { Label } from '@/components/ui/label';
import { 
  ChevronUpIcon, 
  BatteryFullIcon, 
  AreaChartIcon, 
  CreditCardIcon, 
  AlertTriangleIcon 
} from 'lucide-react';

// SUI単位をユーザーフレンドリーな形式に変換
function formatSui(amount: bigint): string {
  const suiInMist = 1000000000n; // 1 SUI = 10^9 MIST
  const sui = Number(amount) / Number(suiInMist);
  return sui.toFixed(4) + ' SUI';
}

// 残高表示用コンポーネント
function BalanceCard({ title, amount, icon, change }: { 
  title: string; 
  amount: bigint; 
  icon: React.ReactNode;
  change?: number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{formatSui(amount)}</h3>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                <BadgeDelta size="sm" deltaType={change >= 0 ? 'increase' : 'decrease'}>
                  {change >= 0 ? '+' : ''}{change}%
                </BadgeDelta>
                <span className="text-xs text-gray-500 ml-2">過去24時間</span>
              </div>
            )}
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// イベントガス割り当てカード
function EventGasCard({ allocation }: { allocation: EventGasAllocation }) {
  const usedPercentage = Number(allocation.used * 100n / allocation.totalAllocated);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">イベント: {allocation.eventId}</CardTitle>
        <CardDescription>
          {allocation.isActive ? 
            'ガススポンサー機能有効' : 
            'ガススポンサー機能無効'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">ガス使用状況</span>
              <span className="text-sm text-gray-500">{usedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">使用済み</span>
              <span className="font-medium">{formatSui(allocation.used)}</span>
            </div>
            <div>
              <span className="block text-gray-500">残り割り当て</span>
              <span className="font-medium">{formatSui(allocation.remainingAllocation)}</span>
            </div>
            <div>
              <span className="block text-gray-500">トランザクション数</span>
              <span className="font-medium">{allocation.transactions}</span>
            </div>
            <div>
              <span className="block text-gray-500">TX最大ガス</span>
              <span className="font-medium">{formatSui(allocation.maxGasPerTx)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">詳細を表示</Button>
      </CardFooter>
    </Card>
  );
}

// ガス追加フォーム
function AddGasForm({ onAddGas }: { onAddGas: (amount: bigint) => void }) {
  const [amount, setAmount] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    // SUIをMIST（内部単位）に変換
    const suiInMist = 1000000000n; // 1 SUI = 10^9 MIST
    const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(suiInMist)));
    onAddGas(amountInMist);
    setAmount('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ガスを追加</CardTitle>
        <CardDescription>
          ガスステーションの残高を増やします
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gas-amount">追加するSUI量</Label>
            <div className="flex space-x-2">
              <Input
                id="gas-amount"
                type="number"
                placeholder="10.0"
                min="0.001"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button type="submit" disabled={!amount || parseFloat(amount) <= 0}>
                追加
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ガス割り当てフォーム
function AllocateGasForm({ 
  availableBalance, 
  eventId, 
  onAllocateGas 
}: { 
  availableBalance: bigint;
  eventId: string;
  onAllocateGas: (eventId: string, amount: bigint, maxPerTx: bigint) => void;
}) {
  const [amount, setAmount] = useState<string>('');
  const [maxPerTx, setMaxPerTx] = useState<string>('0.01');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    // SUIをMIST（内部単位）に変換
    const suiInMist = 1000000000n; // 1 SUI = 10^9 MIST
    const amountInMist = BigInt(Math.floor(parseFloat(amount) * Number(suiInMist)));
    const maxPerTxInMist = BigInt(Math.floor(parseFloat(maxPerTx) * Number(suiInMist)));
    
    onAllocateGas(eventId, amountInMist, maxPerTxInMist);
    setAmount('');
  };
  
  // 利用可能な最大SUI
  const maxAvailableSui = Number(availableBalance) / 1000000000;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">イベントにガスを割り当て</CardTitle>
        <CardDescription>
          イベント {eventId} にガスを割り当てます
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alloc-amount">割り当てるSUI量</Label>
            <Input
              id="alloc-amount"
              type="number"
              placeholder={`最大 ${maxAvailableSui.toFixed(4)}`}
              min="0.001"
              max={maxAvailableSui.toString()}
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-per-tx">トランザクションあたりの最大SUI</Label>
            <Input
              id="max-per-tx"
              type="number"
              placeholder="0.01"
              min="0.001"
              step="0.001"
              value={maxPerTx}
              onChange={(e) => setMaxPerTx(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              1回のトランザクションで使用できる最大ガス量
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAvailableSui}
          >
            ガスを割り当て
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// メインのガス管理コンポーネント
export default function GasManagement({ eventId }: { eventId?: string }) {
  const { toast } = useToast();
  
  // ガスステーションの状態を取得
  const { 
    data: gasStationState, 
    isLoading: isLoadingState,
    refetch: refetchState
  } = useQuery({
    queryKey: ['gas-station', 'state'],
    queryFn: getGasStationState
  });
  
  // イベントのガス割り当てを取得（eventIdが指定されている場合）
  const { 
    data: eventAllocation, 
    isLoading: isLoadingAllocation,
    refetch: refetchAllocation
  } = useQuery({
    queryKey: ['gas-station', 'event', eventId],
    queryFn: () => getEventGasAllocation(eventId || '0'),
    enabled: !!eventId
  });
  
  // ガス追加ミューテーション
  const addGasMutation = useMutation({
    mutationFn: (amount: bigint) => addGasStationBalance(amount),
    onSuccess: () => {
      toast({
        title: 'ガスを追加しました',
        description: 'ガスステーションの残高が更新されました。',
      });
      refetchState();
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: `ガスの追加に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: 'destructive',
      });
    }
  });
  
  // ガス割り当てミューテーション
  const allocateGasMutation = useMutation({
    mutationFn: ({ eventId, amount, maxPerTx }: { eventId: string; amount: bigint; maxPerTx: bigint }) => 
      allocateGasToEvent(eventId, amount, maxPerTx),
    onSuccess: () => {
      toast({
        title: 'ガスを割り当てました',
        description: 'イベントへのガス割り当てが完了しました。',
      });
      refetchState();
      if (eventId) refetchAllocation();
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: `ガスの割り当てに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: 'destructive',
      });
    }
  });
  
  // ガス追加ハンドラー
  const handleAddGas = (amount: bigint) => {
    addGasMutation.mutate(amount);
  };
  
  // ガス割り当てハンドラー
  const handleAllocateGas = (eventId: string, amount: bigint, maxPerTx: bigint) => {
    allocateGasMutation.mutate({ eventId, amount, maxPerTx });
  };
  
  // ローディング中の表示
  if (isLoadingState || (eventId && isLoadingAllocation)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // ガスステーション状態がない場合
  if (!gasStationState) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertTriangleIcon className="h-5 w-5" />
          <span>ガスステーションの状態を取得できませんでした</span>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">ガス管理</h2>
        <p className="text-gray-500 mb-6">
          イベント参加者のトランザクションガス代を肩代わりするためのガス管理システムです。
          残高の追加や各イベントへのガス割り当てが可能です。
        </p>
      </div>
      
      {/* ガスステーション概要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard 
          title="利用可能なガス残高" 
          amount={gasStationState.availableBalance}
          icon={<BatteryFullIcon className="h-6 w-6 text-green-600" />}
          change={5}
        />
        <BalanceCard 
          title="割り当て済みガス" 
          amount={gasStationState.allocatedBalance}
          icon={<AreaChartIcon className="h-6 w-6 text-blue-600" />}
        />
        <BalanceCard 
          title="使用済みガス合計" 
          amount={gasStationState.totalUsed}
          icon={<CreditCardIcon className="h-6 w-6 text-purple-600" />}
          change={12}
        />
      </div>
      
      <Separator />
      
      {/* 管理アクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AddGasForm onAddGas={handleAddGas} />
        
        {eventId && (
          <AllocateGasForm 
            availableBalance={gasStationState.availableBalance}
            eventId={eventId}
            onAllocateGas={handleAllocateGas}
          />
        )}
      </div>
      
      {/* イベントガス割り当て一覧 */}
      {eventId && eventAllocation && (
        <>
          <Separator />
          <div>
            <h3 className="text-xl font-bold mb-4">イベントガス割り当て</h3>
            <EventGasCard allocation={eventAllocation} />
          </div>
        </>
      )}
    </div>
  );
}