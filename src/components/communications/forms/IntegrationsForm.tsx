
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the current Twilio phone number from system_config
  const { data: phoneConfigData, refetch } = useQuery({
    queryKey: ['twilio-phone-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('name', ['vapi_twilio_phone', 'whatsapp_number']);
      
      if (error) {
        toast.error('Failed to load configuration');
        console.error('Error fetching configuration:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Extract current phone numbers if available
  const currentVapiPhone = phoneConfigData?.find(c => c.name === 'vapi_twilio_phone')?.value || '';
  const currentWhatsappPhone = phoneConfigData?.find(c => c.name === 'whatsapp_number')?.value || '';

  // Initialize with current values if available and not already set
  useState(() => {
    if (currentVapiPhone && !twilioPhone) {
      setTwilioPhone(currentVapiPhone);
    }
  });

  const handleSaveIntegrations = async () => {
    try {
      setIsSaving(true);
      
      // Save integration settings to system_config table
      const integrationUpdates = [
        { name: 'vapi_webhook_url', value: webhookUrl },
        { name: 'vapi_twilio_phone', value: twilioPhone },
        { name: 'whatsapp_number', value: twilioPhone } // Use the same number for WhatsApp
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
      
      await refetch(); // Refresh the data
      toast.success("Integration settings saved successfully");
    } catch (error) {
      console.error("Error saving integration settings:", error);
      toast.error("Failed to save integration settings");
    } finally {
      setIsSaving(false);
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
            The phone number used for voice calls and WhatsApp messaging
          </p>
          {currentVapiPhone && currentWhatsappPhone && currentVapiPhone !== currentWhatsappPhone && (
            <p className="text-xs text-amber-500">
              Note: You currently have different numbers configured for voice ({currentVapiPhone}) and WhatsApp ({currentWhatsappPhone}). 
              Saving will use the same number for both services.
            </p>
          )}
        </div>
      </div>
      
      <Button 
        className="gap-2" 
        onClick={handleSaveIntegrations}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save Integration Settings</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default IntegrationsForm;
