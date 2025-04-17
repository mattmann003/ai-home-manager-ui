
import { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface IssueCallButtonProps {
  issueId: string;
  guestPhone?: string;
  guestName?: string;
}

const IssueCallButton = ({ issueId, guestPhone, guestName }: IssueCallButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(guestPhone || '');
  const [isCalling, setIsCalling] = useState(false);

  const initiateCall = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    setIsCalling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vapi-handler', {
        body: {
          phoneNumber,
          issueId,
          guestName: guestName || 'Guest'
        },
        method: 'POST',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to initiate call, check Edge Function logs");
      }
      
      toast.success("Call initiated successfully");
      setIsDialogOpen(false);
      
      // Add timeline entry
      await supabase
        .from('issue_timeline')
        .insert({
          issue_id: issueId,
          status: 'Open', // Don't change status
          note: `AI assistant call initiated to ${guestName || 'guest'} at ${phoneNumber}`
        });
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <PhoneCall className="h-4 w-4" />
        <span>Call Guest</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Initiate AI Assistant Call</DialogTitle>
            <DialogDescription>
              Make an automated call to the guest about this maintenance issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="phone-number" className="text-sm font-medium">
                Guest Phone Number
              </label>
              <Input
                id="phone-number"
                placeholder="+1 (555) 555-5555"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isCalling}
              />
              <p className="text-xs text-muted-foreground">
                Enter the guest's phone number to initiate an AI assistant call.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCalling}
            >
              Cancel
            </Button>
            <Button 
              onClick={initiateCall}
              disabled={isCalling || !phoneNumber}
            >
              {isCalling ? 'Calling...' : 'Call Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueCallButton;
