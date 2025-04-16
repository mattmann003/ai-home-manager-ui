
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DispatchConfiguration from './dispatch/DispatchConfiguration';
import DispatchDashboard from './dispatch/DispatchDashboard';
import ManualOverride from './dispatch/ManualOverride';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

const HandymanDispatchSystem = () => {
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Fetch configuration data
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['dispatch-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('name', ['dispatch_template', 'whatsapp_number']);
      
      if (error) throw error;
      
      // Transform array to object
      return data.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});
    },
  });

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Handyman Dispatch System</h2>
        <p className="text-muted-foreground">
          Manage maintenance issue assignments via WhatsApp
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="dashboard">Dispatch Dashboard</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="manual">Manual Override</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DispatchDashboard />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <DispatchConfiguration 
            initialConfig={configData}
            isLoading={configLoading}
          />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualOverride />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default HandymanDispatchSystem;
