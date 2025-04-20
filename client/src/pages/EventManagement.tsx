import { useState } from "react";
import Header from "@/components/Header";
import EventForm from "@/components/EventForm";
import EventSuccessPanel from "@/components/EventSuccessPanel";
import QRCodeModal from "@/components/QRCodeModal";
import { Event } from "@shared/schema";

export default function EventManagement() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [registeredEvent, setRegisteredEvent] = useState<Event | null>(null);

  const handleEventRegistered = (event: Event) => {
    setRegisteredEvent(event);
    setRegistrationComplete(true);
  };

  const handleResetForm = () => {
    setRegistrationComplete(false);
    setRegisteredEvent(null);
  };

  const handleShowQR = () => {
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header subtitle="イベント管理画面" />

      {!registrationComplete ? (
        <EventForm onEventRegistered={handleEventRegistered} />
      ) : (
        <EventSuccessPanel 
          event={registeredEvent!} 
          onShowQR={handleShowQR} 
          onResetForm={handleResetForm} 
        />
      )}

      {showQRModal && registeredEvent && (
        <QRCodeModal 
          eventName={registeredEvent.eventName} 
          eventId={registeredEvent.id} 
          onClose={handleCloseQR} 
        />
      )}
    </div>
  );
}
