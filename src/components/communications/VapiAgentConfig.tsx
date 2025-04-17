
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Phone, Save, Play, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
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

type AgentFormValues = z.infer<typeof agentFormSchema>;

const VapiAgentConfig = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isActive, setIsActive] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Initialize form with default values from system config
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      agentName: "AI Maintenance Assistant",
      welcomeMessage: "Hello, this is the AI Maintenance Assistant. How can I help you today?",
      voice: "nova",
      language: "en-US",
      maxCallDuration: 15,
      fallbackPhone: "+14155555555",
    },
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
      
      setIsActive(true);
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <CardTitle>Voice Assistant Configuration</CardTitle>
            <CardDescription>Configure your Vapi voice assistant settings</CardDescription>
          </div>
          <Badge 
            variant={isActive ? "default" : "outline"}
            className={isActive ? "bg-green-500 hover:bg-green-600" : "text-yellow-600 border-yellow-200 bg-yellow-50"}
          >
            {isActive ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Inactive
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="prompts">Prompt Templates</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
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
          </TabsContent>
          
          <TabsContent value="prompts">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-medium mb-2">Identity Verification Prompt</h3>
                <Textarea 
                  className="min-h-24"
                  placeholder="To verify your identity, I'll need to ask some questions..."
                  defaultValue="To verify your identity, I'll need to ask some questions about your property. Could you please tell me your full name and the address of your property?"
                />
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-medium mb-2">Issue Triage Prompt</h3>
                <Textarea 
                  className="min-h-24"
                  placeholder="To help you with your issue, I'll need to gather some information..."
                  defaultValue="To help you with your issue, I'll need to gather some information. Could you please describe the problem you're experiencing in detail? When did it start? Is it affecting the entire property or just a specific area?"
                />
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-medium mb-2">Escalation Prompt</h3>
                <Textarea 
                  className="min-h-24"
                  placeholder="I'll need to transfer you to a human agent..."
                  defaultValue="I understand this is a complex issue that requires expert attention. I'll need to transfer you to one of our maintenance specialists who can better assist you. Please hold while I connect you."
                />
              </div>
              
              <Button className="gap-2 mt-2">
                <Save className="h-4 w-4" />
                Save Prompts
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="integrations">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vapi-api-key">Vapi API Key</Label>
                  <Input
                    id="vapi-api-key"
                    type="password"
                    placeholder="vapi_1234abcd5678..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Vapi API key for voice assistant functionality
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-webhook-endpoint.com/vapi-hook"
                  />
                  <p className="text-xs text-muted-foreground">
                    Endpoint that receives events from the voice assistant
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    placeholder="sk-1234abcd5678..."
                  />
                  <p className="text-xs text-muted-foreground">
                    For generating AI responses during calls
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twilio-phone">Twilio Phone Number</Label>
                  <Input
                    id="twilio-phone"
                    placeholder="+15551234567"
                  />
                  <p className="text-xs text-muted-foreground">
                    The outbound caller ID for your voice assistant
                  </p>
                </div>
              </div>
              
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Integration Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VapiAgentConfig;
