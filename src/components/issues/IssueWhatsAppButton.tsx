
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { formatPhoneNumber } from '@/utils/phoneFormatUtils';

interface IssueWhatsAppButtonProps {
  issueId: string;
  guestPhone?: string;
  guestName?: string;
}

const IssueWhatsAppButton = ({ issueId, guestPhone, guestName }: IssueWhatsAppButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageType, setMessageType] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Get the configured communication numbers
  const { data: commsConfig } = useQuery({
    queryKey: ['comms-config'],
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

  const sendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Use the phone number provided or prompt the user to enter one
      if (!guestPhone) {
        toast.error("No phone number available to message");
        setIsSending(false);
        setIsDialogOpen(false);
        return;
      }
      
      // Call the edge function to send the message
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: messageType === 'whatsapp' ? 'send_message' : 'send_sms',
          to: guestPhone,
          message,
          issueId,
        },
        method: 'POST',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast.success(`${messageType === 'whatsapp' ? 'WhatsApp' : 'SMS'} message sent successfully`);
      setIsDialogOpen(false);
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send ${messageType === 'whatsapp' ? 'WhatsApp' : 'SMS'} message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <MessageSquare className="h-4 w-4" />
        <span>Message Guest</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to the guest about this maintenance issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              {guestPhone ? (
                <>Messaging <span className="font-medium">{guestName || 'Guest'}</span> at <span className="font-medium">{formatPhoneNumber(guestPhone)}</span></>
              ) : (
                "No phone number available for this guest."
              )}
            </p>
            
            <Tabs defaultValue="whatsapp" onValueChange={(value) => setMessageType(value as 'whatsapp' | 'sms')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="whatsapp" disabled={!whatsappConfigured}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span>WhatsApp</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="sms" disabled={!smsConfigured}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>SMS</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="whatsapp">
                {!whatsappConfigured && (
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700 text-sm mb-4">
                    WhatsApp is not configured. Please configure it in the Communications settings.
                  </div>
                )}
                <Textarea
                  placeholder="Type your WhatsApp message here..."
                  className="min-h-[100px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending || !guestPhone || !whatsappConfigured}
                />
              </TabsContent>
              
              <TabsContent value="sms">
                {!smsConfigured && (
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700 text-sm mb-4">
                    SMS is not configured. Please configure it in the Communications settings.
                  </div>
                )}
                <Textarea
                  placeholder="Type your SMS message here..."
                  className="min-h-[100px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending || !guestPhone || !smsConfigured}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={sendMessage}
              disabled={isSending || !message.trim() || !guestPhone || 
                (messageType === 'whatsapp' && !whatsappConfigured) || 
                (messageType === 'sms' && !smsConfigured)}
            >
              {isSending ? 'Sending...' : `Send ${messageType === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueWhatsAppButton;
