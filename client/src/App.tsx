import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import EventManagement from "@/pages/EventManagement";
import EventParticipant from "@/pages/EventParticipant";
import Home from "@/pages/Home";

// Sui Wallet プロバイダーのインポート
import { 
  WalletKitProvider, 
  SuiClientProvider,
  WalletProvider
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiNetwork } from './lib/suiClient';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/event-management" component={EventManagement} />
      <Route path="/event-participant/:id?" component={EventParticipant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Sui ネットワークの設定
  const networks = {
    testnet: { url: getFullnodeUrl('testnet') }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>
          <TooltipProvider>
            <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #EFF6FF, white)" }}>
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
