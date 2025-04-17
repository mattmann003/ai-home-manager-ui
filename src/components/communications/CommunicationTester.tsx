
import { useState } from 'react';
import { Send, MessageSquare, PhoneCall } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPhoneE164 } from '@/utils/phoneFormatUtils';

const CommunicationTester = () => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp');

  // Get the communication numbers
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
    if (!recipientPhone) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    if (!message) {
      toast.error('Please enter a message');
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

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

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
    if (!recipientPhone) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    if (!message) {
      toast.error('Please enter a message');
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

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

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
          phoneNumber: formattedPhone,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.message);
      }

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
        <Tabs defaultValue="whatsapp" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="whatsapp">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span>WhatsApp</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="sms">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>SMS</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="voice">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4" />
                <span>Voice</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            {!whatsappConfigured && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700 text-sm mb-4">
                WhatsApp is not configured yet. Please configure it in the WhatsApp Setup panel.
              </div>
            )}
            
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
            {!smsConfigured && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700 text-sm mb-4">
                SMS is not configured yet. Please configure it in the SMS Setup panel.
              </div>
            )}
            
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
        </Tabs>
      </CardContent>
      <CardFooter>
        {activeTab === 'whatsapp' ? (
          <Button 
            onClick={handleSendWhatsApp} 
            disabled={isSending || !whatsappConfigured}
            className="w-full gap-2"
          >
            {isSending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send WhatsApp</span>
              </>
            )}
          </Button>
        ) : activeTab === 'sms' ? (
          <Button 
            onClick={handleSendSMS} 
            disabled={isSending || !smsConfigured}
            className="w-full gap-2"
          >
            {isSending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send SMS</span>
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleInitiateCall} 
            disabled={isSending}
            className="w-full gap-2"
          >
            {isSending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Initiating Call...</span>
              </>
            ) : (
              <>
                <PhoneCall className="h-4 w-4" />
                <span>Initiate Call</span>
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CommunicationTester;
