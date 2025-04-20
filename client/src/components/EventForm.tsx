import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEventSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import NFTSection from "./NFTSection";
import { Event } from "@shared/schema";

// Extend the event schema with client-side validations
const eventFormSchema = insertEventSchema
  .extend({
    mintStartDate: z.coerce.date(),
    mintEndDate: z.coerce.date(),
    mintLimit: z.coerce.number().min(1, "発行上限数は1以上である必要があります"),
  })
  .refine((data) => data.mintEndDate > data.mintStartDate, {
    message: "ミント終了日時はミント開始日時より後である必要があります",
    path: ["mintEndDate"],
  });

type EventFormProps = {
  onEventRegistered: (event: Event) => void;
};

export default function EventForm({ onEventRegistered }: EventFormProps) {
  const { toast } = useToast();
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [nftAnimationFile, setNftAnimationFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      eventName: "Tech Conference 2025",
      eventDetails: "最新技術のカンファレンスです。参加者には限定NFTが発行されます。",
      mintStartDate: new Date("2025/04/20 10:00"),
      mintEndDate: new Date("2025/04/30 18:00"),
      mintLimit: 10,
      gasSponsored: true,
      transferable: false,
      passphrase: "aikotoba",
      nftName: "Tech Conference 2025 参加証",
      nftDescription: "このNFTは2025年テクノロジーカンファレンスへの参加を証明するものです。",
      nftImageUrl: "",
      nftAnimationUrl: "",
    },
  });

  const eventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof eventFormSchema>) => {
      // In a real implementation, we would upload the image to IPFS or similar service
      // and set the URLs accordingly
      
      // For this demo, we'll use a data URL for the image preview
      let nftImageUrl = previewUrl || "";
      let nftAnimationUrl = nftAnimationFile ? nftAnimationFile.name : "";
      
      const formData = {
        ...data,
        nftImageUrl,
        nftAnimationUrl,
      };
      
      const response = await apiRequest("POST", "/api/events", formData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "イベント登録完了",
        description: "イベント情報が正常に登録されました。",
      });
      onEventRegistered(data);
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: `イベント登録に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (file: File | null) => {
    setNftImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnimationChange = (file: File | null) => {
    setNftAnimationFile(file);
  };

  const onSubmit = (data: z.infer<typeof eventFormSchema>) => {
    eventMutation.mutate(data);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-blue-100 px-6 py-4 border-b border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800">イベント情報登録</h3>
      </div>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>イベント名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eventDetails"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>イベント詳細</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mintStartDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>ミント開始日時</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : new Date();
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mintEndDate"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>ミント終了日時</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : new Date();
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="mintLimit"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>NFTの発行上限数</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gasSponsored"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>ガス代肩代わり設定</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex space-x-4 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="gas-fee-no" />
                        <Label htmlFor="gas-fee-no">肩代わりしない</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="gas-fee-yes" />
                        <Label htmlFor="gas-fee-yes">肩代わりする</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {field.value && (
                    <div className="bg-blue-50 p-3 rounded-md mt-2 border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">スポンサードトランザクション</h4>
                      <p className="text-xs text-blue-700 mb-2">
                        このオプションを有効にすると、参加者はガス代（トランザクション手数料）を支払うことなくNFTを受け取れます。
                        あなたがイベント主催者としてガス代を負担します。
                      </p>
                      <div className="flex items-center space-x-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-blue-600" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        <span className="text-xs text-blue-700">
                          ガス代肩代わりには事前にガスステーションにSUIをチャージする必要があります。
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("gasSponsored") && (
              <FormField
                control={form.control}
                name="gasPerMint"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>NFT1個あたりのガス上限</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2 items-center">
                        <Input 
                          type="number" 
                          placeholder="0.01" 
                          min="0.001" 
                          step="0.001"
                          value={field.value || "0.01"}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                        <span className="text-sm text-gray-500">SUI</span>
                      </div>
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      NFT1個をミントするために許可する最大ガス量。多くの場合、0.01〜0.05 SUIが適切です。
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="transferable"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>NFTの譲渡設定</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "true")}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex space-x-4 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="transfer-allowed" />
                        <Label htmlFor="transfer-allowed">譲渡可</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="transfer-not-allowed" />
                        <Label htmlFor="transfer-not-allowed">譲渡不可</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">※譲渡不可を選択すると、NFTの所有者は変更できなくなります。</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="passphrase"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center">
                    合言葉 <i className="fas fa-key ml-2 text-gray-400"></i>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <NFTSection 
              form={form}
              onImageChange={handleImageChange} 
              onAnimationChange={handleAnimationChange}
              previewUrl={previewUrl}
            />
            
            <Button 
              type="submit" 
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow transition"
              disabled={eventMutation.isPending}
            >
              {eventMutation.isPending ? "登録中..." : "イベント情報を登録"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
