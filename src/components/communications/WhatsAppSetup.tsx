
import { useState } from 'react';
import { Phone } from 'lucide-react';
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

const WhatsAppSetup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Fetch current WhatsApp number from system_config
  const { data: configData, isLoading, refetch } = useQuery<Tables<'system_config'> | null>({
    queryKey: ['whatsapp-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('name', 'whatsapp_number')
        .maybeSingle();

      if (error) {
        toast.error('Failed to load WhatsApp configuration');
        return null;
      }

      return data;
    }
  });

  const handleConfigureWhatsApp = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsConfiguring(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'configure',
          phoneNumber: phoneNumber
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      // Also update the Vapi phone number to maintain consistency
      const { error: vapiUpdateError } = await supabase
        .from('system_config')
        .upsert({
          name: 'vapi_twilio_phone',
          value: phoneNumber,
          description: 'Twilio phone number for outbound calls'
        });
        
      if (vapiUpdateError) {
        console.warn("Failed to update Vapi phone number:", vapiUpdateError);
      }
      
      toast.success('WhatsApp number configured successfully');
      refetch(); // Refresh the config data
      setPhoneNumber('');
    } catch (error) {
      console.error('Error configuring WhatsApp:', error);
      toast.error(`Failed to configure WhatsApp: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const formattedPhoneNumber = configData?.value ? 
    `+${configData.value.replace(/\D/g, '')}` : 
    'Not configured';

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">WhatsApp Messaging</CardTitle>
        <CardDescription>
          Configure WhatsApp for tenant communication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Phone className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-lg font-medium">{formattedPhoneNumber}</span>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
              Active
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-muted p-2 rounded-full">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-lg font-medium">Not Configured</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp-number">Twilio WhatsApp Number</Label>
              <Input 
                id="whatsapp-number" 
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {configData 
            ? "Tenants can send WhatsApp messages to this number to report maintenance issues." 
            : "Configure your Twilio WhatsApp number to enable messaging for maintenance issues."}
        </p>
      </CardContent>
      {!configData && (
        <CardFooter>
          <Button 
            onClick={handleConfigureWhatsApp} 
            disabled={isConfiguring || !phoneNumber}
            className="w-full"
          >
            {isConfiguring ? 'Configuring...' : 'Configure WhatsApp'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WhatsAppSetup;
