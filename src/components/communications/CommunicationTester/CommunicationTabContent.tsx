
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CommunicationTabContentProps {
  activeTab: string;
  recipientPhone: string;
  setRecipientPhone: (phone: string) => void;
  message: string;
  setMessage: (msg: string) => void;
  isSending: boolean;
  whatsappConfigured: boolean;
  smsConfigured: boolean;
}

export const CommunicationTabContent: React.FC<CommunicationTabContentProps> = ({
  activeTab,
  recipientPhone,
  setRecipientPhone,
  message,
  setMessage,
  isSending,
  whatsappConfigured,
  smsConfigured
}) => {
  const renderConfigWarning = (channelName: string) => (
    <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700 text-sm mb-4">
      {channelName} is not configured yet. Please configure it in the {channelName} Setup panel.
    </div>
  );

  return (
    <>
      <TabsContent value="whatsapp" className="space-y-4 mt-4">
        {!whatsappConfigured && renderConfigWarning('WhatsApp')}
        
        <div className="grid gap-2">
          <Label htmlFor="recipient-phone">Recipient Phone Number</Label>
          <Input 
            id="recipient-phone" 
            placeholder="+1234567890"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message" 
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            rows={3}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="sms" className="space-y-4 mt-4">
        {!smsConfigured && renderConfigWarning('SMS')}
        
        <div className="grid gap-2">
          <Label htmlFor="sms-recipient-phone">Recipient Phone Number</Label>
          <Input 
            id="sms-recipient-phone" 
            placeholder="+1234567890"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="sms-message">Message</Label>
          <Textarea 
            id="sms-message" 
            placeholder="Enter your SMS message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            rows={3}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="voice" className="space-y-4 mt-4">
        <div className="grid gap-2">
          <Label htmlFor="voice-recipient-phone">Recipient Phone Number</Label>
          <Input 
            id="voice-recipient-phone" 
            placeholder="+1234567890"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          This will initiate a call to the recipient using the AI voice assistant.
        </p>
      </TabsContent>
    </>
  );
};
