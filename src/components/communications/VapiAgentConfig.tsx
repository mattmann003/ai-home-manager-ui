
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BasicSettingsForm, { AgentFormValues } from './forms/BasicSettingsForm';
import PromptTemplatesForm from './forms/PromptTemplatesForm';
import IntegrationsForm from './forms/IntegrationsForm';

const VapiAgentConfig = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<{
    basicSettings: AgentFormValues;
    promptTemplates: {
      identityVerification: string;
      issueTriage: string;
      escalation: string;
    };
    integrations: {
      vapiApiKey: string;
      webhookUrl: string;
      openAiApiKey: string;
      twilioPhone: string;
    };
  }>({
    basicSettings: {
      agentName: "AI Maintenance Assistant",
      welcomeMessage: "Hello, this is the AI Maintenance Assistant. How can I help you today?",
      voice: "nova",
      language: "en-US",
      maxCallDuration: 15,
      fallbackPhone: "+14155555555",
    },
    promptTemplates: {
      identityVerification: "",
      issueTriage: "",
      escalation: "",
    },
    integrations: {
      vapiApiKey: "",
      webhookUrl: "",
      openAiApiKey: "",
      twilioPhone: "",
    }
  });

  // Load configuration from Supabase when component mounts
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('name, value')
          .in('name', [
            'vapi_agent_name',
            'vapi_welcome_message',
            'vapi_voice',
            'vapi_language',
            'vapi_max_call_duration',
            'vapi_fallback_phone',
            'vapi_identity_verification_prompt',
            'vapi_issue_triage_prompt',
            'vapi_escalation_prompt',
            'vapi_webhook_url',
            'vapi_twilio_phone'
          ]);

        if (error) {
          throw error;
        }

        // Check if we have any configuration values
        if (data && data.length > 0) {
          setIsActive(true);
          
          // Extract basic settings
          const newBasicSettings = { ...config.basicSettings };
          const newPromptTemplates = { ...config.promptTemplates };
          const newIntegrations = { ...config.integrations };
          
          // Process each config item
          data.forEach(item => {
            switch (item.name) {
              case 'vapi_agent_name':
                newBasicSettings.agentName = item.value;
                break;
              case 'vapi_welcome_message':
                newBasicSettings.welcomeMessage = item.value;
                break;
              case 'vapi_voice':
                newBasicSettings.voice = item.value;
                break;
              case 'vapi_language':
                newBasicSettings.language = item.value;
                break;
              case 'vapi_max_call_duration':
                newBasicSettings.maxCallDuration = parseInt(item.value) || 15;
                break;
              case 'vapi_fallback_phone':
                newBasicSettings.fallbackPhone = item.value;
                break;
              case 'vapi_identity_verification_prompt':
                newPromptTemplates.identityVerification = item.value;
                break;
              case 'vapi_issue_triage_prompt':
                newPromptTemplates.issueTriage = item.value;
                break;
              case 'vapi_escalation_prompt':
                newPromptTemplates.escalation = item.value;
                break;
              case 'vapi_webhook_url':
                newIntegrations.webhookUrl = item.value;
                break;
              case 'vapi_twilio_phone':
                newIntegrations.twilioPhone = item.value;
                break;
            }
          });
          
          setConfig({
            basicSettings: newBasicSettings,
            promptTemplates: newPromptTemplates,
            integrations: newIntegrations
          });
        }
      } catch (err) {
        console.error("Error loading agent configuration:", err);
        toast.error("Failed to load agent configuration");
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

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
            <BasicSettingsForm 
              defaultValues={config.basicSettings} 
              onConfigSaved={setIsActive} 
            />
          </TabsContent>
          
          <TabsContent value="prompts">
            <PromptTemplatesForm initialValues={config.promptTemplates} />
          </TabsContent>
          
          <TabsContent value="integrations">
            <IntegrationsForm initialValues={config.integrations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VapiAgentConfig;
