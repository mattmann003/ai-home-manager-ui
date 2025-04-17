
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, PhoneCall } from 'lucide-react';

interface CommunicationFooterProps {
  activeTab: string;
  isSending: boolean;
  whatsappConfigured?: boolean;
  smsConfigured?: boolean;
  onSendWhatsApp: () => void;
  onSendSMS: () => void;
  onInitiateCall: () => void;
}

export const CommunicationFooter: React.FC<CommunicationFooterProps> = ({
  activeTab,
  isSending,
  whatsappConfigured,
  smsConfigured,
  onSendWhatsApp,
  onSendSMS,
  onInitiateCall
}) => {
  const renderSendButton = () => {
    if (activeTab === 'whatsapp') {
      return (
        <Button 
          onClick={onSendWhatsApp} 
          disabled={isSending || !whatsappConfigured}
          className="w-full gap-2"
        >
          {renderButtonContent('WhatsApp', <Send className="h-4 w-4" />)}
        </Button>
      );
    }
    
    if (activeTab === 'sms') {
      return (
        <Button 
          onClick={onSendSMS} 
          disabled={isSending || !smsConfigured}
          className="w-full gap-2"
        >
          {renderButtonContent('SMS', <Send className="h-4 w-4" />)}
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={onInitiateCall} 
        disabled={isSending}
        className="w-full gap-2"
      >
        {renderButtonContent('Call', <PhoneCall className="h-4 w-4" />)}
      </Button>
    );
  };

  const renderButtonContent = (actionText: string, icon: React.ReactNode) => {
    if (isSending) {
      return (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          <span>Initiating {actionText}...</span>
        </>
      );
    }
    
    return (
      <>
        {icon}
        <span>{actionText === 'Call' ? 'Initiate Call' : `Send ${actionText}`}</span>
      </>
    );
  };

  return renderSendButton();
};
