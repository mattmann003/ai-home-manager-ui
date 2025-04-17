
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { formatPhoneE164 } from '@/utils/phoneFormatUtils';

import { CommunicationTabs } from './CommunicationTester/CommunicationTabs';
import { CommunicationTabContent } from './CommunicationTester/CommunicationTabContent';
import { CommunicationFooter } from './CommunicationTester/CommunicationFooter';

const CommunicationTester = () => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp');

  const { data: commsConfig } = useQuery({
    queryKey: ['comms-config-for-testing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('name', ['whatsapp_number', 'sms_number']);

      if (error) {
        console.error('Failed to load communication configuration:', error);
        return [];
      }

      return data || [];
    }
  });

  const whatsappConfigured = !!commsConfig?.find(c => c.name === 'whatsapp_number')?.value;
  const smsConfigured = !!commsConfig?.find(c => c.name === 'sms_number')?.value;

  const handleSendWhatsApp = async () => {
    if (!recipientPhone || !message) {
      toast.error('Please enter a recipient phone number and message');
      return;
    }

    const formattedPhone = formatPhoneE164(recipientPhone);
    if (!formattedPhone) {
      toast.error('Invalid phone number format');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'send_message',
          to: formattedPhone,
          message: message
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.message);

      toast.success('WhatsApp message sent successfully');
      setMessage('');
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error(`Failed to send WhatsApp: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!recipientPhone || !message) {
      toast.error('Please enter a recipient phone number and message');
      return;
    }

    const formattedPhone = formatPhoneE164(recipientPhone);
    if (!formattedPhone) {
      toast.error('Invalid phone number format');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'send_sms',
          to: formattedPhone,
          message: message
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.message);

      toast.success('SMS message sent successfully');
      setMessage('');
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error(`Failed to send SMS: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!recipientPhone) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    const formattedPhone = formatPhoneE164(recipientPhone);
    if (!formattedPhone) {
      toast.error('Invalid phone number format');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('vapi-handler', {
        body: {
          phoneNumber: formattedPhone
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.message);

      toast.success('Call initiated successfully');
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Communication Tester</CardTitle>
        <CardDescription>
          Test your communication channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CommunicationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          whatsappConfigured={whatsappConfigured}
          smsConfigured={smsConfigured}
        />
        
        <CommunicationTabContent
          activeTab={activeTab}
          recipientPhone={recipientPhone}
          setRecipientPhone={setRecipientPhone}
          message={message}
          setMessage={setMessage}
          isSending={isSending}
          whatsappConfigured={whatsappConfigured}
          smsConfigured={smsConfigured}
        />
      </CardContent>
      <CardFooter>
        <CommunicationFooter
          activeTab={activeTab}
          isSending={isSending}
          whatsappConfigured={whatsappConfigured}
          smsConfigured={smsConfigured}
          onSendWhatsApp={handleSendWhatsApp}
          onSendSMS={handleSendSMS}
          onInitiateCall={handleInitiateCall}
        />
      </CardFooter>
    </Card>
  );
};

export default CommunicationTester;
