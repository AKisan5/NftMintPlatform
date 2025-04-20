import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header subtitle="ホーム" />
      
      <Card className="mb-8">
        <CardHeader className="bg-blue-100 border-b border-blue-200">
          <CardTitle>NFTアプリケーション選択</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-gray-800">参加証NFT発行アプリへようこそ</h2>
            <p className="text-gray-600">
              このアプリでは、イベントの参加証としてNFTを発行・配布することができます。
              イベント主催者と参加者、それぞれの画面を選択してください。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-primary">イベント主催者</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-gray-600">
                  イベント情報を登録し、参加者へ配布するNFTを設定します。
                </p>
                <Link to="/event-management">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    イベント管理画面へ
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-primary">イベント参加者</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-6 text-gray-600">
                  イベントの合言葉を入力し、参加証NFTを受け取ります。
                </p>
                <Link to="/event-participant">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    イベント参加者画面へ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
