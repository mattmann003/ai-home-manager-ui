
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
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
import { formatPhoneNumber, formatPhoneE164 } from '@/utils/phoneFormatUtils';

const SMSSetup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Fetch current SMS number from system_config
  const { data: configData, isLoading, refetch } = useQuery<Tables<'system_config'> | null>({
    queryKey: ['sms-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('name', 'sms_number')
        .maybeSingle();

      if (error) {
        toast.error('Failed to load SMS configuration');
        return null;
      }

      return data;
    }
  });

  const handleConfigureSMS = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsConfiguring(true);
    
    try {
      // Format phone number in E.164 format for Twilio
      const formattedPhone = formatPhoneE164(phoneNumber);
      
      if (!formattedPhone) {
        throw new Error('Invalid phone number format');
      }
      
      const { data, error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'configure_sms',
          phoneNumber: formattedPhone
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message);
      }
      
      // Update the SMS number in system_config
      const { error: updateError } = await supabase
        .from('system_config')
        .upsert({
          name: 'sms_number',
          value: formattedPhone,
          description: 'Twilio phone number for SMS notifications'
        });
        
      if (updateError) {
        console.warn("Failed to update SMS phone number:", updateError);
      }
      
      toast.success('SMS number configured successfully');
      refetch(); // Refresh the config data
      setPhoneNumber('');
    } catch (error) {
      console.error('Error configuring SMS:', error);
      toast.error(`Failed to configure SMS: ${error.message}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const formattedPhoneNumber = configData?.value ? 
    formatPhoneNumber(configData.value) : 
    'Not configured';

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">SMS Messaging</CardTitle>
        <CardDescription>
          Configure SMS for tenant communication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <MessageSquare className="h-4 w-4 text-blue-500" />
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
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-lg font-medium">Not Configured</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sms-number">Twilio SMS Number</Label>
              <Input 
                id="sms-number" 
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {configData 
            ? "Tenants can receive SMS messages at this number for maintenance issues." 
            : "Configure your Twilio SMS number to enable SMS messaging for maintenance issues."}
        </p>
      </CardContent>
      {!configData && (
        <CardFooter>
          <Button 
            onClick={handleConfigureSMS} 
            disabled={isConfiguring || !phoneNumber}
            className="w-full"
          >
            {isConfiguring ? 'Configuring...' : 'Configure SMS'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SMSSetup;
