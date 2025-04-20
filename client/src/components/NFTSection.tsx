import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type NFTSectionProps = {
  form: UseFormReturn<any>;
  onImageChange: (file: File | null) => void;
  onAnimationChange: (file: File | null) => void;
  previewUrl: string | null;
};

export default function NFTSection({ 
  form, 
  onImageChange, 
  onAnimationChange, 
  previewUrl 
}: NFTSectionProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const animationInputRef = useRef<HTMLInputElement>(null);
  const [animationFileName, setAnimationFileName] = useState<string>("選択されていません");
  
  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };
  
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    onImageChange(file || null);
  };
  
  const handleAnimationButtonClick = () => {
    if (animationInputRef.current) {
      animationInputRef.current.click();
    }
  };
  
  const handleAnimationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAnimationFileName(file.name);
      onAnimationChange(file);
    } else {
      setAnimationFileName("選択されていません");
      onAnimationChange(null);
    }
  };
  
  return (
    <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
        <h4 className="text-md font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          配布するNFT
        </h4>
      </div>
      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* NFT Image Upload Area */}
          <div className="w-full md:w-1/3">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 h-48 cursor-pointer hover:bg-gray-100 transition duration-200 relative overflow-hidden"
              onClick={handleImageClick}
            >
              {!previewUrl ? (
                <div className="text-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">NFT画像をアップロード</p>
                  <p className="text-xs text-gray-500">クリックして選択</p>
                </div>
              ) : (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${previewUrl})` }}
                >
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-0 hover:bg-opacity-50 transition duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white text-sm font-medium">画像を変更</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageInputChange}
              />
            </div>
          </div>
          
          {/* NFT Info */}
          <div className="w-full md:w-2/3 space-y-4">
            <FormField
              control={form.control}
              name="nftName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>NFT名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nftDescription"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>NFT説明</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>動画アニメーション（任意）</FormLabel>
              <div className="flex items-center">
                <input
                  type="file"
                  ref={animationInputRef}
                  className="hidden"
                  accept="video/*"
                  onChange={handleAnimationInputChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAnimationButtonClick}
                  className="text-sm text-gray-700"
                >
                  ファイルを選択
                </Button>
                <span className="ml-3 text-sm text-gray-500">{animationFileName}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 italic mt-2">
              このNFTは一般参加者に配布されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
