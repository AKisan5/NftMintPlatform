import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@shared/schema";

type ParticipantCardProps = {
  step: string;
  event: Partial<Event> | null;
  walletAddress: string;
  transactionId: string;
  onPassphraseVerified: (event: Partial<Event>) => void;
  onWalletConnected: (address: string) => void;
  onNFTMinted: (txId: string) => void;
};

export default function ParticipantCard({
  step,
  event,
  walletAddress,
  transactionId,
  onPassphraseVerified,
  onWalletConnected,
  onNFTMinted
}: ParticipantCardProps) {
  const { toast } = useToast();
  const [passphrase, setPassphrase] = useState("");
  const [passphraseError, setPassphraseError] = useState(false);
  const [passphraseSuccess, setPassphraseSuccess] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  
  // Verify passphrase mutation
  const verifyPassphraseMutation = useMutation({
    mutationFn: async (passphrase: string) => {
      const response = await apiRequest("POST", "/api/verify-passphrase", { passphrase });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        setPassphraseError(false);
        setPassphraseSuccess(true);
        
        setTimeout(() => {
          onPassphraseVerified(data.event);
        }, 1500);
      } else {
        setPassphraseError(true);
        setPassphraseSuccess(false);
      }
    },
    onError: () => {
      setPassphraseError(true);
      setPassphraseSuccess(false);
      toast({
        title: "エラー",
        description: "合言葉の検証中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  });
  
  // NFT mint mutation
  const mintNftMutation = useMutation({
    mutationFn: async () => {
      if (!event?.id || !walletAddress) {
        throw new Error("Event ID or wallet address missing");
      }
      
      // In a real implementation, this would interact with the blockchain
      const mintData = {
        eventId: event.id,
        walletAddress: walletAddress,
        transactionId: `tx_${Date.now()}` // This would be a real transaction ID from the blockchain
      };
      
      const response = await apiRequest("POST", "/api/mint-nft", mintData);
      return await response.json();
    },
    onSuccess: (data) => {
      setIsMinting(false);
      setMintSuccess(true);
      onNFTMinted(data.transactionId);
    },
    onError: (error) => {
      setIsMinting(false);
      toast({
        title: "ミントエラー",
        description: `NFTのミントに失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handlePassphraseCheck = () => {
    if (!passphrase.trim()) {
      setPassphraseError(true);
      return;
    }
    
    verifyPassphraseMutation.mutate(passphrase);
  };
  
  const handleConnectWallet = () => {
    setIsConnectingWallet(true);
    
    // In a real implementation, this would connect to a blockchain wallet
    setTimeout(() => {
      setIsConnectingWallet(false);
      const mockWalletAddress = "0x" + Math.random().toString(16).slice(2, 42);
      onWalletConnected(mockWalletAddress);
    }, 2000);
  };
  
  const handleMintNft = () => {
    setIsMinting(true);
    mintNftMutation.mutate();
  };
  
  // Helper to get step title
  const getStepTitle = () => {
    switch (step) {
      case "passphrase":
        return "合言葉の入力";
      case "wallet":
        return "ウォレット接続";
      case "mint":
        return "NFTミント";
      default:
        return "合言葉の入力";
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-blue-100 px-6 py-4 border-b border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
      </div>
      
      <CardContent className="p-6">
        {/* Event Info Panel */}
        {event && (
          <div className="bg-blue-600 text-white rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{event.eventName}</h4>
              <p className="text-sm text-blue-100">{event.eventDetails}</p>
              {event.mintStartDate && event.mintEndDate && (
                <div className="text-xs bg-blue-700 inline-block px-2 py-1 rounded mt-2">
                  ミント期間: {format(new Date(event.mintStartDate), 'yyyy/MM/dd HH:mm')} 〜 {format(new Date(event.mintEndDate), 'yyyy/MM/dd HH:mm')}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 1: Passphrase */}
        {step === "passphrase" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                合言葉 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </label>
              <Input
                type="text"
                placeholder="合言葉を入力してください"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
            </div>
            
            {passphraseError && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">合言葉が間違っています。もう一度お試しください。</p>
                  </div>
                </div>
              </div>
            )}
            
            {passphraseSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">合言葉が確認できました。次のステップに進みます。</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              className="w-full bg-primary hover:bg-primary-dark"
              onClick={handlePassphraseCheck}
              disabled={verifyPassphraseMutation.isPending || passphraseSuccess}
            >
              {verifyPassphraseMutation.isPending ? "確認中..." : "合言葉を確認"}
            </Button>
          </div>
        )}
        
        {/* Step 2: Wallet Connection */}
        {step === "wallet" && (
          <div className="space-y-4">
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">参加証NFTを受け取るには、ウォレットの接続が必要です。下のボタンからウォレットを接続してください。</p>
                </div>
              </div>
            </div>
            
            {!isConnectingWallet ? (
              <Button
                className="w-full py-3 bg-primary hover:bg-primary-dark"
                onClick={handleConnectWallet}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                ウォレットを接続する
              </Button>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-gray-600">ウォレット接続中...</p>
              </div>
            )}
          </div>
        )}
        
        {/* Step 3: NFT Mint */}
        {step === "mint" && (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-lg overflow-hidden w-48 h-48 flex items-center justify-center">
                {event?.nftImageUrl ? (
                  <img 
                    src={event.nftImageUrl}
                    alt={event.nftName || "NFT Preview"}
                    className="object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
            
            {!isMinting && !mintSuccess && (
              <Button
                className="w-full py-3 bg-primary hover:bg-primary-dark"
                onClick={handleMintNft}
              >
                NFTをミントする
              </Button>
            )}
            
            {isMinting && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-gray-600">NFTをミント中...</p>
              </div>
            )}
            
            {mintSuccess && (
              <div className="text-center py-4">
                <div className="rounded-full h-16 w-16 bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-800 mb-1">NFTのミントが完了しました！</h4>
                <p className="text-gray-600">参加証NFTがウォレットに追加されました。ご参加ありがとうございます！</p>
                {transactionId && (
                  <p className="text-xs text-gray-500 mt-2">Transaction ID: {transactionId}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
