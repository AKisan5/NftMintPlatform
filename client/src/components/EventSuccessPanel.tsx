import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type EventSuccessPanelProps = {
  event: Event;
  onShowQR: () => void;
  onResetForm: () => void;
};

export default function EventSuccessPanel({ 
  event, 
  onShowQR, 
  onResetForm 
}: EventSuccessPanelProps) {
  const { toast } = useToast();
  const eventUrl = `${window.location.origin}/event-participant/${event.id}`;
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      toast({
        title: "URLをコピーしました",
        description: "イベント参加者用URLがクリップボードにコピーされました。",
      });
    } catch (err) {
      toast({
        title: "コピーに失敗しました",
        description: "URLのコピーに失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">イベント情報の登録が完了しました。</p>
          </div>
        </div>
      </div>
      
      <Card className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="bg-blue-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold">イベント情報</h3>
        </div>
        
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">イベント名</h4>
              <p className="text-gray-800">{event.eventName}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">ミント期間</h4>
              <p className="text-gray-800">
                {format(new Date(event.mintStartDate), 'yyyy/MM/dd HH:mm')} 〜 {format(new Date(event.mintEndDate), 'yyyy/MM/dd HH:mm')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">合言葉</h4>
              <p className="text-gray-800">{event.passphrase}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">NFT名</h4>
              <p className="text-gray-800">{event.nftName}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">ガス代肩代わり</h4>
              <p className="text-gray-800">{event.gasSponsored ? "肩代わりする" : "肩代わりしない"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">譲渡設定</h4>
              <p className="text-gray-800">{event.transferable ? "譲渡可" : "譲渡不可"}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">イベント参加者用URL</h4>
            <div className="flex">
              <Input
                type="text"
                value={eventUrl}
                readOnly
                className="flex-1 rounded-r-none bg-gray-50"
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-l-none"
                onClick={handleCopyUrl}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                コピー
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row gap-4 mt-6">
            <Button
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={onShowQR}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              イベント参加者用QRコードにする
            </Button>
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={onResetForm}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新しいイベントを登録
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
