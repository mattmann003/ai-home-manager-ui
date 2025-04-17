
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

  // Get the WhatsApp number
  const { data: whatsappConfig } = useQuery({
    queryKey: ['whatsapp-config-for-testing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('name', 'whatsapp_number')
        .maybeSingle();

      if (error) {
        console.error('Failed to load WhatsApp configuration:', error);
        return null;
      }

      return data;
    }
  });

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

  const isWhatsAppConfigured = !!whatsappConfig?.value;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Communication Tester</CardTitle>
        <CardDescription>
          Test your WhatsApp and voice call features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="whatsapp">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="voice">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4" />
                <span>Voice Call</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            {!isWhatsAppConfigured && (
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
        <Tabs.Consumer>
          {(context) => 
            context?.value === 'whatsapp' ? (
              <Button 
                onClick={handleSendWhatsApp} 
                disabled={isSending || !isWhatsAppConfigured}
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
            )
          }
        </Tabs.Consumer>
      </CardFooter>
    </Card>
  );
};

export default CommunicationTester;
