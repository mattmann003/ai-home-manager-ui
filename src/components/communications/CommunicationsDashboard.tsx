
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessagesSquare, Settings, Beaker } from 'lucide-react';
import WhatsAppSetup from './WhatsAppSetup';
import SMSSetup from './SMSSetup';
import VoiceCallPanel from './VoiceCallPanel';
import CommunicationTester from './CommunicationTester';
import BasicSettingsForm from './forms/BasicSettingsForm';
import IntegrationsForm from './forms/IntegrationsForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DispatchConfiguration from './dispatch/DispatchConfiguration';

const CommunicationsDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch system configuration
  const { data: configData, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');

      if (error) {
        throw error;
      }

      return data || [];
    }
  });

  // Extract agent settings
  const agentSettings = {
    agentName: configData?.find(config => config.name === 'vapi_agent_name')?.value || 'AI Assistant',
    welcomeMessage: configData?.find(config => config.name === 'vapi_welcome_message')?.value || 'Hello, this is the AI Assistant. How can I help you today?',
    voice: configData?.find(config => config.name === 'vapi_voice')?.value || 'nova',
    language: configData?.find(config => config.name === 'vapi_language')?.value || 'en-US',
    maxCallDuration: Number(configData?.find(config => config.name === 'vapi_max_call_duration')?.value || '15'),
    fallbackPhone: configData?.find(config => config.name === 'vapi_fallback_phone')?.value || '',
  };

  // Extract integration settings
  const integrationSettings = {
    vapiApiKey: '', // We don't expose API keys
    webhookUrl: configData?.find(config => config.name === 'vapi_webhook_url')?.value || '',
    openAiApiKey: '', // We don't expose API keys
    twilioPhone: configData?.find(config => config.name === 'vapi_twilio_phone')?.value || '',
  };

  // Extract dispatch configuration
  const dispatchConfig = {
    dispatch_template: configData?.find(config => config.name === 'dispatch_template')?.value,
    whatsapp_number: configData?.find(config => config.name === 'whatsapp_number')?.value,
  };

  const handleConfigSaved = (isActive: boolean) => {
    queryClient.invalidateQueries({ queryKey: ['system-config'] });
    queryClient.invalidateQueries({ queryKey: ['voice-agent-config'] });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Communications</h1>
      <p className="text-muted-foreground">
        Manage your communication channels and automation settings.
      </p>

      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tools</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="dispatch">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Dispatch</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="testing">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              <span className="hidden sm:inline">Testing</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WhatsAppSetup />
            <SMSSetup />
            <VoiceCallPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="dispatch" className="space-y-6">
          <DispatchConfiguration initialConfig={dispatchConfig} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-6">
          <div className="max-w-xl mx-auto">
            <CommunicationTester />
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Voice Assistant Configuration</h2>
            <BasicSettingsForm 
              defaultValues={agentSettings} 
              onConfigSaved={handleConfigSaved} 
            />
          </div>
          
          <div className="space-y-6 pt-6">
            <h2 className="text-lg font-semibold">Integration Settings</h2>
            <IntegrationsForm initialValues={integrationSettings} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationsDashboard;
