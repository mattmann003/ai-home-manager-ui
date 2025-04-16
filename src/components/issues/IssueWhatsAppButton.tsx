
import { useState } from 'react';
import { MessageSquare, WhatsApp } from 'lucide-react';
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

interface IssueWhatsAppButtonProps {
  issueId: string;
  guestPhone?: string;
  guestName?: string;
}

const IssueWhatsAppButton = ({ issueId, guestPhone, guestName }: IssueWhatsAppButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const sendWhatsAppMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Use the phone number provided or prompt the user to enter one
      const phoneNumber = guestPhone;
      
      if (!phoneNumber) {
        toast.error("No phone number available to message");
        setIsSending(false);
        setIsDialogOpen(false);
        return;
      }
      
      // Call the edge function to send the WhatsApp message
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'send_message',
          to: phoneNumber,
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
      
      toast.success("Message sent successfully");
      setIsDialogOpen(false);
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(`Failed to send message: ${error.message}`);
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
        <WhatsApp className="h-4 w-4 text-green-500" />
        <span>WhatsApp</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a WhatsApp message to the guest about this maintenance issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              {guestPhone ? (
                <>Messaging <span className="font-medium">{guestName || 'Guest'}</span> at <span className="font-medium">{guestPhone}</span></>
              ) : (
                "No phone number available for this guest."
              )}
            </p>
            
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending || !guestPhone}
            />
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
              onClick={sendWhatsAppMessage}
              disabled={isSending || !message.trim() || !guestPhone}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueWhatsAppButton;
