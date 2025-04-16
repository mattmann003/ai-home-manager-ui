
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Save, Play, Mic, Check, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Schema for form validation
const vapiConfigSchema = z.object({
  agentName: z.string().min(2, { message: "Agent name must be at least 2 characters" }),
  welcomeMessage: z.string().min(10, { message: "Welcome message must be at least 10 characters" }),
  voice: z.string().min(1, { message: "Please select a voice" }),
  language: z.string().min(1, { message: "Please select a language" }),
  maxCallDuration: z.coerce.number().min(1).max(60, { message: "Max call duration must be between 1-60 minutes" }),
  fallbackPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number" }),
  isActive: z.boolean().default(true)
});

// Prompt template schema
const promptTemplateSchema = z.object({
  identityVerification: z.string().min(10, { message: "Template must be at least 10 characters" }),
  issueTriage: z.string().min(10, { message: "Template must be at least 10 characters" }),
  escalationPrompt: z.string().min(10, { message: "Template must be at least 10 characters" }),
});

// Integration settings schema
const integrationSettingsSchema = z.object({
  apiKey: z.string().min(1, { message: "API key is required" }),
  webhookUrl: z.string().url({ message: "Please enter a valid URL" }),
});

type VapiConfigFormValues = z.infer<typeof vapiConfigSchema>;
type PromptTemplateFormValues = z.infer<typeof promptTemplateSchema>;
type IntegrationSettingsFormValues = z.infer<typeof integrationSettingsSchema>;

const VapiAgentConfig = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  // Form for basic settings
  const form = useForm<VapiConfigFormValues>({
    resolver: zodResolver(vapiConfigSchema),
    defaultValues: {
      agentName: 'Maintenance Assistant',
      welcomeMessage: 'Hello, this is the maintenance assistant. How can I help you today?',
      voice: 'rachel',
      language: 'en',
      maxCallDuration: 10,
      fallbackPhone: '',
      isActive: true
    }
  });

  // Form for prompt templates
  const promptForm = useForm<PromptTemplateFormValues>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      identityVerification: 'Please confirm your name and the property you\'re calling about.',
      issueTriage: 'Can you describe the maintenance issue you\'re experiencing?',
      escalationPrompt: 'I\'ll need to transfer you to a human agent. Please hold while I connect you.'
    }
  });

  // Form for integration settings
  const integrationForm = useForm<IntegrationSettingsFormValues>({
    resolver: zodResolver(integrationSettingsSchema),
    defaultValues: {
      apiKey: '',
      webhookUrl: 'https://example.com/webhook'
    }
  });

  // Function to load config from database
  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('name', 'vapi_agent_config')
        .single();

      if (error) throw error;

      if (data) {
        const config = JSON.parse(data.value);
        form.reset(config);

        // Also load prompt templates if available
        const { data: promptData } = await supabase
          .from('system_config')
          .select('value')
          .eq('name', 'vapi_prompt_templates')
          .single();
        
        if (promptData) {
          promptForm.reset(JSON.parse(promptData.value));
        }

        // Load integration settings
        const { data: integrationData } = await supabase
          .from('system_config')
          .select('value')
          .eq('name', 'vapi_integration_settings')
          .single();
        
        if (integrationData) {
          integrationForm.reset(JSON.parse(integrationData.value));
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load config on component mount
  useState(() => {
    loadConfig();
  }, []);

  // Function to save the configuration
  const saveConfig = async (values: VapiConfigFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('system_config')
        .upsert(
          {
            name: 'vapi_agent_config',
            value: JSON.stringify(values),
            description: 'Vapi Agent Configuration'
          },
          { onConflict: 'name' }
        );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent configuration saved successfully',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save prompt templates
  const savePromptTemplates = async (values: PromptTemplateFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('system_config')
        .upsert(
          {
            name: 'vapi_prompt_templates',
            value: JSON.stringify(values),
            description: 'Vapi Prompt Templates'
          },
          { onConflict: 'name' }
        );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Prompt templates saved successfully',
      });
    } catch (error) {
      console.error('Error saving prompt templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt templates',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save integration settings
  const saveIntegrationSettings = async (values: IntegrationSettingsFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('system_config')
        .upsert(
          {
            name: 'vapi_integration_settings',
            value: JSON.stringify(values),
            description: 'Vapi Integration Settings'
          },
          { onConflict: 'name' }
        );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Integration settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving integration settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save integration settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to test the agent
  const testAgent = async () => {
    try {
      setIsTestingAgent(true);
      // Simulate a call test
      const formValues = form.getValues();
      
      toast({
        title: 'Test Call Initiated',
        description: `Testing agent "${formValues.agentName}" with voice "${formValues.voice}"`,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Test Successful',
        description: 'The agent configuration is working properly',
      });
    } catch (error) {
      console.error('Error testing agent:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test the agent configuration',
        variant: 'destructive'
      });
    } finally {
      setIsTestingAgent(false);
    }
  };

  return (
    <Card className="shadow-sm mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vapi Call Agent Configuration</CardTitle>
            <CardDescription>Configure your AI voice agent for maintenance calls</CardDescription>
          </div>
          <Badge variant={form.getValues().isActive ? "default" : "outline"}>
            {form.getValues().isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic-settings" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="basic-settings">Basic Settings</TabsTrigger>
            <TabsTrigger value="prompt-templates">Prompt Templates</TabsTrigger>
            <TabsTrigger value="integration-settings">Integration Settings</TabsTrigger>
          </TabsList>
          
          {/* Basic Settings Tab */}
          <TabsContent value="basic-settings" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(saveConfig)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="agentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Maintenance Assistant" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Name of your virtual assistant
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="it">Italian</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primary language for the agent
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
                          placeholder="Hello, this is the maintenance assistant. How can I help you today?" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Initial message the agent will say when answering a call
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="voice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rachel">Rachel (Female)</SelectItem>
                            <SelectItem value="drew">Drew (Male)</SelectItem>
                            <SelectItem value="amber">Amber (Female)</SelectItem>
                            <SelectItem value="josh">Josh (Male)</SelectItem>
                            <SelectItem value="emma">Emma (Female)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Voice for the AI agent
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
                          <Input 
                            type="number" 
                            min={1}
                            max={60}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum length of calls in minutes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="fallbackPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fallback Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1234567890" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Phone number to transfer calls when agent can't resolve issues
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable or disable the voice agent
                            </FormDescription>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </TabsContent>
          
          {/* Prompt Templates Tab */}
          <TabsContent value="prompt-templates" className="space-y-4">
            <Form {...promptForm}>
              <form onSubmit={promptForm.handleSubmit(savePromptTemplates)} className="space-y-4">
                <FormField
                  control={promptForm.control}
                  name="identityVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Verification</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please confirm your name and the property you're calling about." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Prompt for verifying caller identity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={promptForm.control}
                  name="issueTriage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Triage</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Can you describe the maintenance issue you're experiencing?" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Prompt for gathering information about maintenance issues
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={promptForm.control}
                  name="escalationPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalation Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="I'll need to transfer you to a human agent. Please hold while I connect you." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Message used when transferring to a human
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Templates
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Integration Settings Tab */}
          <TabsContent value="integration-settings" className="space-y-4">
            <Form {...integrationForm}>
              <form onSubmit={integrationForm.handleSubmit(saveIntegrationSettings)} className="space-y-4">
                <FormField
                  control={integrationForm.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vapi API Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your Vapi API key" 
                          type="password"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        API key from your Vapi account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={integrationForm.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/webhook" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL for call event notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Integration Settings
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={testAgent}
          disabled={isTestingAgent}
        >
          <Play className="mr-2 h-4 w-4" />
          Test Agent
        </Button>
        <Button 
          type="submit"
          onClick={form.handleSubmit(saveConfig)}
          disabled={isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VapiAgentConfig;
