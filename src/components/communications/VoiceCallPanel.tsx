
import { useState } from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQuery } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';

const VoiceCallPanel = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  // Fetch agent configuration from system_config
  const { data: configData, isLoading } = useQuery<Tables<'system_config'>[]>({
    queryKey: ['voice-agent-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('name', [
          'vapi_agent_name', 
          'vapi_webhook_url', 
          'vapi_twilio_phone'
        ]);

      if (error) {
        toast.error('Failed to load voice agent configuration');
        return [];
      }

      return data || [];
    }
  });

  // Check if the agent is configured
  const isAgentConfigured = configData && configData.some(config => 
    config.name === 'vapi_agent_name' && config.value
  );

  // Get the agent name and phone number
  const agentName = configData?.find(config => config.name === 'vapi_agent_name')?.value || 'AI Assistant';
  const agentPhone = configData?.find(config => config.name === 'vapi_twilio_phone')?.value || 'Not configured';

  const handleInitiateCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsCalling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('vapi-handler', {
        body: {
          phoneNumber: phoneNumber,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      toast.success('Call initiated successfully');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(`Failed to initiate call: ${error.message}`);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Voice Assistant</CardTitle>
        <CardDescription>
          Make outbound calls using the AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAgentConfigured ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <PhoneCall className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <div className="text-lg font-medium">{agentName}</div>
                <div className="text-sm text-muted-foreground">Calling from: {agentPhone}</div>
              </div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
              Active
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-muted p-2 rounded-full">
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-lg font-medium">Not Configured</span>
          </div>
        )}
        
        {isAgentConfigured && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Recipient Phone Number</Label>
              <Input 
                id="phone-number" 
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isCalling}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a phone number to initiate an outbound call from the AI assistant.
            </p>
          </div>
        )}
      </CardContent>
      {isAgentConfigured && (
        <CardFooter>
          <Button 
            onClick={handleInitiateCall} 
            disabled={isCalling || !phoneNumber}
            className="w-full gap-2"
          >
            {isCalling ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Calling...</span>
              </>
            ) : (
              <>
                <Phone className="h-4 w-4" />
                <span>Make Call</span>
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default VoiceCallPanel;
