import { create } from 'zustand';
import { Event } from '@shared/schema';

interface EventStore {
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  
  currentStep: 'passphrase' | 'wallet' | 'mint';
  setCurrentStep: (step: 'passphrase' | 'wallet' | 'mint') => void;
  
  transactionId: string | null;
  setTransactionId: (txId: string | null) => void;
  
  resetState: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  currentEvent: null,
  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  walletAddress: null,
  setWalletAddress: (address) => set({ walletAddress: address }),
  
  currentStep: 'passphrase',
  setCurrentStep: (step) => set({ currentStep: step }),
  
  transactionId: null,
  setTransactionId: (txId) => set({ transactionId: txId }),
  
  resetState: () => set({
    currentEvent: null,
    walletAddress: null,
    currentStep: 'passphrase',
    transactionId: null,
  }),
}));
