
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

// Define schema for form validation
const configFormSchema = z.object({
  dispatchTemplate: z.string().min(10, { message: "Template must be at least 10 characters" }),
  whatsappNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  includeAttachments: z.boolean().default(false),
  responseTimeout: z.coerce.number().min(5, { message: "Timeout must be at least 5 minutes" }),
  autoEscalate: z.boolean().default(true),
  maxRetries: z.coerce.number().min(1, { message: "Must be at least 1" }).max(5, { message: "Maximum 5 retries" }),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

interface DispatchConfigurationProps {
  initialConfig?: any;
  isLoading?: boolean;
}

const VARIABLE_HELP = [
  { name: '{handyman_name}', description: 'Name of the assigned handyman' },
  { name: '{property_name}', description: 'Name of the property' },
  { name: '{property_address}', description: 'Full address of the property' },
  { name: '{issue_title}', description: 'Title of the maintenance issue' },
  { name: '{issue_description}', description: 'Detailed description of the issue' },
  { name: '{issue_priority}', description: 'Priority level of the issue' },
  { name: '{issue_id}', description: 'Unique ID of the issue' },
];

const DispatchConfiguration = ({ initialConfig, isLoading }: DispatchConfigurationProps) => {
  const [isSaving, setIsSaving] = useState(false);

  // Set up form with default values
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      dispatchTemplate: initialConfig?.dispatch_template || 
        'New maintenance issue at {property_address}. Issue: {issue_title}. Details: {issue_description}. Reply "1" to accept or "2" to decline.',
      whatsappNumber: initialConfig?.whatsapp_number || '',
      includeAttachments: false,
      responseTimeout: 30,
      autoEscalate: true,
      maxRetries: 3,
    },
  });

  // Update form values when initialConfig changes
  useState(() => {
    if (initialConfig && !isLoading) {
      form.reset({
        dispatchTemplate: initialConfig.dispatch_template || form.getValues('dispatchTemplate'),
        whatsappNumber: initialConfig.whatsapp_number || form.getValues('whatsappNumber'),
        includeAttachments: form.getValues('includeAttachments'),
        responseTimeout: form.getValues('responseTimeout'),
        autoEscalate: form.getValues('autoEscalate'),
        maxRetries: form.getValues('maxRetries'),
      });
    }
  });

  const onSubmit = async (data: ConfigFormValues) => {
    setIsSaving(true);
    
    try {
      // Save dispatch template
      const { error: templateError } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'configure_template',
          template: data.dispatchTemplate
        },
        method: 'POST',
      });
      
      if (templateError) throw new Error(templateError.message);
      
      // Save WhatsApp number
      const { error: whatsAppError } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'configure',
          phoneNumber: data.whatsappNumber
        },
        method: 'POST',
      });
      
      if (whatsAppError) throw new Error(whatsAppError.message);
      
      // Save other config values in the system_config table directly
      await Promise.all([
        supabase.from('system_config').upsert({
          name: 'dispatch_include_attachments',
          value: data.includeAttachments.toString(),
          description: 'Whether to include attachments in dispatch messages'
        }),
        supabase.from('system_config').upsert({
          name: 'dispatch_response_timeout',
          value: data.responseTimeout.toString(),
          description: 'Timeout in minutes for handyman responses'
        }),
        supabase.from('system_config').upsert({
          name: 'dispatch_auto_escalate',
          value: data.autoEscalate.toString(),
          description: 'Auto-escalate if handyman does not respond'
        }),
        supabase.from('system_config').upsert({
          name: 'dispatch_max_retries',
          value: data.maxRetries.toString(),
          description: 'Maximum number of retries before escalation'
        })
      ]);
      
      toast.success("Dispatch configuration saved successfully");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('dispatchTemplate') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + variable + text.substring(end);
      
      form.setValue('dispatchTemplate', newText);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispatch Configuration</CardTitle>
        <CardDescription>
          Configure how maintenance issues are dispatched to handymen via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Twilio WhatsApp sender number. Must be in international format.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dispatchTemplate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Message Template</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">Available Variables</h4>
                            <p className="text-sm text-muted-foreground">
                              Use these variables in your template:
                            </p>
                            <div className="max-h-[200px] overflow-y-auto">
                              {VARIABLE_HELP.map(variable => (
                                <div key={variable.name} className="flex justify-between text-sm py-1">
                                  <code className="bg-muted px-1 rounded">{variable.name}</code>
                                  <span className="text-muted-foreground text-xs">{variable.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormControl>
                      <Textarea 
                        id="dispatchTemplate"
                        placeholder="Enter message template..." 
                        className="min-h-[150px]" 
                        {...field}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {VARIABLE_HELP.map(variable => (
                        <Button
                          key={variable.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable.name)}
                        >
                          {variable.name}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="responseTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Response Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={5} {...field} />
                      </FormControl>
                      <FormDescription>
                        Time to wait for a response before follow-up
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxRetries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Retries</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={5} {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of follow-up attempts before escalation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="includeAttachments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Include Attachments</FormLabel>
                        <FormDescription>
                          Attach issue photos to dispatch messages
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoEscalate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Auto-Escalation</FormLabel>
                        <FormDescription>
                          Automatically escalate if no response
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DispatchConfiguration;
