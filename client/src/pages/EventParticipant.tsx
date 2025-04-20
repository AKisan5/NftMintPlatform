import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ParticipantCard from "@/components/ParticipantCard";
import { Event } from "@shared/schema";

enum ParticipantStep {
  PASSPHRASE = "passphrase",
  WALLET = "wallet",
  MINT = "mint"
}

export default function EventParticipant() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState<ParticipantStep>(ParticipantStep.PASSPHRASE);
  const [verifiedEvent, setVerifiedEvent] = useState<Partial<Event> | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [mintTxId, setMintTxId] = useState<string>("");
  
  // If eventId is provided in URL, fetch event details
  const { data: eventData } = useQuery({
    queryKey: id ? [`/api/events/${id}`] : null,
    enabled: !!id
  });

  useEffect(() => {
    if (eventData) {
      setVerifiedEvent(eventData);
    }
  }, [eventData]);

  const handlePassphraseVerified = (event: Partial<Event>) => {
    setVerifiedEvent(event);
    setCurrentStep(ParticipantStep.WALLET);
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setCurrentStep(ParticipantStep.MINT);
  };

  const handleNFTMinted = (txId: string) => {
    setMintTxId(txId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header subtitle="イベント参加者画面" />
      
      <ParticipantCard
        step={currentStep}
        event={verifiedEvent}
        walletAddress={walletAddress}
        transactionId={mintTxId}
        onPassphraseVerified={handlePassphraseVerified}
        onWalletConnected={handleWalletConnected}
        onNFTMinted={handleNFTMinted}
      />
    </div>
  );
}
