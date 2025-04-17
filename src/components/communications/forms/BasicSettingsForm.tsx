
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the form schema using zod
const agentFormSchema = z.object({
  agentName: z.string().min(3, { message: "Agent name must be at least 3 characters" }),
  welcomeMessage: z.string().min(10, { message: "Welcome message must be at least 10 characters" }),
  voice: z.string({ required_error: "Please select a voice" }),
  language: z.string({ required_error: "Please select a language" }),
  maxCallDuration: z.coerce.number().min(1).max(60, { message: "Max duration must be between 1 and 60 minutes" }),
  fallbackPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number" }),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

interface BasicSettingsFormProps {
  defaultValues: AgentFormValues;
  onConfigSaved: (isActive: boolean) => void;
}

const BasicSettingsForm = ({ defaultValues, onConfigSaved }: BasicSettingsFormProps) => {
  const [isTesting, setIsTesting] = useState(false);

  // Initialize form
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: AgentFormValues) => {
    try {
      // Save configuration to system_config table
      const configUpdates = [
        { name: 'vapi_agent_name', value: data.agentName },
        { name: 'vapi_welcome_message', value: data.welcomeMessage },
        { name: 'vapi_voice', value: data.voice },
        { name: 'vapi_language', value: data.language },
        { name: 'vapi_max_call_duration', value: data.maxCallDuration.toString() },
        { name: 'vapi_fallback_phone', value: data.fallbackPhone },
      ];

      // Batch update system configuration
      for (const config of configUpdates) {
        const { error } = await supabase
          .from('system_config')
          .upsert({ 
            name: config.name, 
            value: config.value 
          })
          .select();

        if (error) {
          throw error;
        }
      }
      
      onConfigSaved(true);
      toast.success("Agent configuration saved successfully");
    } catch (error) {
      console.error("Error saving agent configuration:", error);
      toast.error("Failed to save agent configuration");
    }
  };

  const handleTestAgent = async () => {
    setIsTesting(true);
    
    try {
      // Simulate a test call by invoking the Vapi handler
      const { data, error } = await supabase.functions.invoke('vapi-handler', {
        body: {
          phoneNumber: form.getValues('fallbackPhone'),
          issueId: null,
          guestName: 'Test Call'
        },
        method: 'POST',
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast.success("Test call completed successfully");
    } catch (error) {
      console.error("Error testing agent:", error);
      toast.error(`Failed to test agent: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="agentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name</FormLabel>
                <FormControl>
                  <Input placeholder="AI Assistant" {...field} />
                </FormControl>
                <FormDescription>
                  The name your assistant will use to identify itself
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voice</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nova">Nova (Female)</SelectItem>
                    <SelectItem value="echo">Echo (Male)</SelectItem>
                    <SelectItem value="bella">Bella (Female)</SelectItem>
                    <SelectItem value="dean">Dean (Male)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The voice your assistant will use during calls
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The language your assistant will speak and understand
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fallbackPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fallback Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 555-5555" {...field} />
                </FormControl>
                <FormDescription>
                  Used when a call needs human intervention
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxCallDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Call Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum duration before call is automatically ended
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="welcomeMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Welcome Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Hello, this is the AI Assistant..." 
                  className="min-h-24"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                The greeting message played at the start of each call
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <Button 
            type="button"
            variant="outline"
            onClick={handleTestAgent}
            disabled={isTesting}
            className="gap-2"
          >
            {isTesting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Test Agent
          </Button>
          
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BasicSettingsForm;
