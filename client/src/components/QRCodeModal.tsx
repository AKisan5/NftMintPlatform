import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import QRCode from "./ui/qr-code";

type QRCodeModalProps = {
  eventName: string;
  eventId: number;
  onClose: () => void;
};

export default function QRCodeModal({ eventName, eventId, onClose }: QRCodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const eventUrl = `${window.location.origin}/event-participant/${eventId}`;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);
  
  const handleSaveQR = () => {
    // In a real implementation, this would save the QR code as an image
    // For now, we'll just create a download link for the QR code
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = `qr-code-${eventName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">イベント参加者用QRコード</h3>
          <button 
            type="button" 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 text-center">
          <div className="bg-white p-2 inline-block mb-4 border border-gray-300 rounded-lg">
            <QRCode
              value={eventUrl}
              size={200}
              level="M"
            />
          </div>
          <p className="text-gray-800 font-medium mb-6">{eventName}</p>
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-primary hover:bg-primary-dark"
              onClick={handleSaveQR}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              QRコードを保存
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
