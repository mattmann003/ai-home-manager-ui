
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationsFormProps {
  initialValues?: {
    vapiApiKey: string;
    webhookUrl: string;
    openAiApiKey: string;
    twilioPhone: string;
  };
}

const IntegrationsForm = ({ initialValues }: IntegrationsFormProps) => {
  const [vapiApiKey, setVapiApiKey] = useState(initialValues?.vapiApiKey || '');
  const [webhookUrl, setWebhookUrl] = useState(initialValues?.webhookUrl || '');
  const [openAiApiKey, setOpenAiApiKey] = useState(initialValues?.openAiApiKey || '');
  const [twilioPhone, setTwilioPhone] = useState(initialValues?.twilioPhone || '');

  const handleSaveIntegrations = async () => {
    try {
      // Save integration settings to system_config table
      const integrationUpdates = [
        { name: 'vapi_webhook_url', value: webhookUrl },
        { name: 'vapi_twilio_phone', value: twilioPhone },
      ];

      // Save sensitive information as secrets (in a real app)
      // For now, just saving non-sensitive settings to database
      for (const config of integrationUpdates) {
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
      
      toast.success("Integration settings saved successfully");
    } catch (error) {
      console.error("Error saving integration settings:", error);
      toast.error("Failed to save integration settings");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vapi-api-key">Vapi API Key</Label>
          <Input
            id="vapi-api-key"
            type="password"
            placeholder="vapi_1234abcd5678..."
            value={vapiApiKey}
            onChange={(e) => setVapiApiKey(e.target.value)}
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
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
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
            value={openAiApiKey}
            onChange={(e) => setOpenAiApiKey(e.target.value)}
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
            value={twilioPhone}
            onChange={(e) => setTwilioPhone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The outbound caller ID for your voice assistant
          </p>
        </div>
      </div>
      
      <Button className="gap-2" onClick={handleSaveIntegrations}>
        <Save className="h-4 w-4" />
        Save Integration Settings
      </Button>
    </div>
  );
};

export default IntegrationsForm;
