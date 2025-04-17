
import { useState, useEffect } from 'react';
import { User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';
import { fetchHandymen, dispatchHandyman } from '@/integrations/supabase/helpers';

interface IssueDispatchButtonProps {
  issueId: string;
  propertyId: string;
  guestPhone?: string;
}

const IssueDispatchButton = ({ issueId, propertyId, guestPhone }: IssueDispatchButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHandyman, setSelectedHandyman] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Fetch available handymen
  const { data: handymen = [], isLoading } = useQuery({
    queryKey: ['handymen', propertyId],
    queryFn: fetchHandymen
  });

  // Fetch dispatch template
  const { data: template } = useQuery({
    queryKey: ['dispatch-template'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_config')
        .select('value')
        .eq('name', 'dispatch_template')
        .maybeSingle();
      
      return data?.value || '';
    }
  });

  // Fetch property details for the template
  const { data: property } = useQuery<Tables<'properties'>>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      
      return data;
    },
    enabled: !!propertyId
  });

  // Fetch issue details for the template
  const { data: issue } = useQuery<Tables<'issues'>>({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const { data } = await supabase
        .from('issues')
        .select('*')
        .eq('id', issueId)
        .single();
      
      return data;
    },
    enabled: !!issueId
  });

  // Generate preview message based on template
  useEffect(() => {
    if (template && property && issue) {
      const propertyAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip_code}`;
      
      let message = template
        .replace('{property_name}', property.name)
        .replace('{property_address}', propertyAddress)
        .replace('{issue_title}', issue.title)
        .replace('{issue_description}', issue.description)
        .replace('{issue_priority}', issue.priority)
        .replace('{issue_id}', issue.id);
      
      // Replace handyman name if one is selected
      if (selectedHandyman) {
        const handyman = handymen.find(h => h.id === selectedHandyman);
        if (handyman) {
          message = message.replace('{handyman_name}', handyman.name);
        }
      }
      
      setCustomMessage(message);
    }
  }, [template, property, issue, selectedHandyman, handymen]);

  const handleDispatch = async () => {
    if (!selectedHandyman) {
      toast.error("Please select a handyman");
      return;
    }
    
    setIsDispatching(true);
    
    try {
      const result = await dispatchHandyman(issueId, selectedHandyman, customMessage, guestPhone);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast.success("Dispatch sent successfully");
      setIsDialogOpen(false);
      setSelectedHandyman('');
      setCustomMessage('');
    } catch (error) {
      console.error("Error dispatching handyman:", error);
      toast.error(`Failed to dispatch: ${error.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <User className="h-4 w-4" />
        <span>Dispatch Handyman</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dispatch Handyman</DialogTitle>
            <DialogDescription>
              Send a WhatsApp message to dispatch a handyman for this issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handyman">Select Handyman</Label>
              <Select
                value={selectedHandyman}
                onValueChange={setSelectedHandyman}
                disabled={isDispatching || isLoading}
              >
                <SelectTrigger id="handyman">
                  <SelectValue placeholder="Choose a handyman" />
                </SelectTrigger>
                <SelectContent>
                  {handymen.map((handyman) => (
                    <SelectItem key={handyman.id} value={handyman.id}>
                      {handyman.name} {handyman.phone ? `(${handyman.phone})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The handyman will receive a WhatsApp message about this issue.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Dispatch Message</Label>
              <Textarea
                id="message"
                placeholder="Dispatch message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[150px]"
                disabled={isDispatching}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>Message will be sent via WhatsApp.</span>
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDispatching}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDispatch}
              disabled={isDispatching || !selectedHandyman || !customMessage}
            >
              {isDispatching ? 'Dispatching...' : 'Dispatch Handyman'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IssueDispatchButton;
