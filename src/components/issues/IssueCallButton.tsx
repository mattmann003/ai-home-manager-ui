
import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface IssueCallButtonProps {
  issueId: string;
  guestPhone?: string;
  guestName?: string;
}

const IssueCallButton = ({ issueId, guestPhone, guestName }: IssueCallButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  const initiateCall = async () => {
    setIsCallInProgress(true);
    
    try {
      // Use the phone number provided or prompt the user to enter one
      const phoneNumber = guestPhone;
      
      if (!phoneNumber) {
        toast.error("No phone number available to call");
        setIsCallInProgress(false);
        setIsDialogOpen(false);
        return;
      }
      
      // Call the edge function to initiate the outbound call
      const { data, error } = await supabase.functions.invoke('vapi-handler', {
        body: {
          phoneNumber,
          issueId,
          guestName,
        },
        method: 'POST',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast.success("Call initiated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsCallInProgress(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <Phone className="h-4 w-4" />
        <span>Call Guest</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Initiate AI Phone Call</DialogTitle>
            <DialogDescription>
              An AI assistant will call the guest to discuss the maintenance issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {guestPhone ? (
                <>Calling <span className="font-medium">{guestName || 'Guest'}</span> at <span className="font-medium">{guestPhone}</span></>
              ) : (
                "No phone number available for this guest."
              )}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCallInProgress}
            >
              Cancel
            </Button>
            <Button 
              onClick={initiateCall}
              disabled={isCallInProgress || !guestPhone}
            >
              {isCallInProgress ? 'Initiating call...' : 'Start Call'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueCallButton;
