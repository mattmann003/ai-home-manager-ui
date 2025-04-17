import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SendIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { formatDistanceToNow } from 'date-fns';
import { 
  fetchDispatchAssignments, 
  type DispatchAssignment 
} from '@/integrations/supabase/helpers';

// Form validation schema
const dispatchFormSchema = z.object({
  issueId: z.string().min(1, { message: "Please select an issue" }),
  handymanId: z.string().min(1, { message: "Please select a handyman" }),
  customMessage: z.string().optional(),
  useCustomMessage: z.boolean().default(false),
  guestPhone: z.string().optional(),
  notifyGuest: z.boolean().default(false),
});

type DispatchFormValues = z.infer<typeof dispatchFormSchema>;

const ManualOverride = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSentDispatch, setLastSentDispatch] = useState<DispatchAssignment | null>(null);

  const form = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      useCustomMessage: false,
      notifyGuest: false,
      customMessage: '',
      guestPhone: '',
    },
  });

  // Fetch open issues 
  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['open-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          status,
          property_id,
          property:properties(name)
        `)
        .in('status', ['Open', 'In Progress'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch handymen
  const { data: handymen, isLoading: handymenLoading } = useQuery({
    queryKey: ['available-handymen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('handymen')
        .select('*')
        .eq('availability', 'Available')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending dispatches to show which handymen are already assigned
  const { data: pendingDispatches } = useQuery({
    queryKey: ['pending-dispatches'],
    queryFn: async () => {
      const assignments = await fetchDispatchAssignments();
      return assignments.filter(a => a.status === 'pending');
    },
  });

  // When an issue is selected, check if we have contact info
  const issueId = form.watch('issueId');
  const { data: issueDetails } = useQuery({
    queryKey: ['issue-details', issueId],
    queryFn: async () => {
      if (!issueId) return null;
      
      const { data, error } = await supabase
        .from('issues')
        .select(`
          id,
          title,
          description,
          property_id,
          property:properties(*)
        `)
        .eq('id', issueId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!issueId,
  });

  const handleSubmit = async (values: DispatchFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { useCustomMessage, customMessage, notifyGuest, guestPhone, ...rest } = values;
      
      const response = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'dispatch',
          ...rest,
          message: useCustomMessage ? customMessage : undefined,
          guestPhone: notifyGuest && guestPhone ? guestPhone : undefined
        },
        method: 'POST',
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Get the dispatch that was just created
      const assignments = await fetchDispatchAssignments();
      const latestDispatch = assignments
        .filter(d => d.issue_id === values.issueId && d.handyman_id === values.handymanId)
        .sort((a, b) => new Date(b.dispatch_time).getTime() - new Date(a.dispatch_time).getTime())[0];
      
      if (latestDispatch) {
        setLastSentDispatch(latestDispatch);
      }
      
      toast.success('Dispatch sent successfully');
      form.reset();
    } catch (error: any) {
      console.error('Error sending dispatch:', error);
      toast.error(`Failed to send dispatch: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHandymanAlreadyAssigned = (issueId: string, handymanId: string) => {
    if (!pendingDispatches) return false;
    return pendingDispatches.some(
      dispatch => dispatch.issue_id === issueId && dispatch.handyman_id === handymanId
    );
  };
  
  const useCustomMessage = form.watch('useCustomMessage');
  const notifyGuest = form.watch('notifyGuest');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Dispatch</CardTitle>
          <CardDescription>
            Override the automatic dispatch system to manually assign handymen to issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Issue</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={issuesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an issue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {issues?.map((issue) => (
                            <SelectItem key={issue.id} value={issue.id}>
                              {issue.title} ({issue.property?.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the maintenance issue to assign
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="handymanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Handyman</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={handymenLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a handyman" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {handymen?.map((handyman) => {
                            const isAssigned = isHandymanAlreadyAssigned(issueId, handyman.id);
                            return (
                              <SelectItem 
                                key={handyman.id} 
                                value={handyman.id}
                                disabled={isAssigned}
                              >
                                {handyman.name} 
                                {isAssigned ? ' (Already assigned)' : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the handyman to assign to this issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="useCustomMessage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Use custom message</FormLabel>
                        <FormDescription>
                          Override the default dispatch message template
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {useCustomMessage && (
                  <FormField
                    control={form.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a custom dispatch message..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Custom message to send to the handyman
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {issueDetails && (
                  <FormField
                    control={form.control}
                    name="notifyGuest"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Notify guest</FormLabel>
                          <FormDescription>
                            Send a WhatsApp message to the guest when a handyman accepts
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {notifyGuest && (
                  <FormField
                    control={form.control}
                    name="guestPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1234567890"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Phone number to notify when a handyman accepts the assignment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Dispatch...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send Dispatch
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {lastSentDispatch && (
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-green-800">Dispatch Sent Successfully</h3>
                <p className="text-sm text-green-700 mt-1">
                  Maintenance request "{lastSentDispatch.issue?.title}" was dispatched to {lastSentDispatch.handyman?.name} {formatDistanceToNow(new Date(lastSentDispatch.dispatch_time))} ago.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualOverride;
