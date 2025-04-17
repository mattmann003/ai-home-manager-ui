
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, PhoneCall } from 'lucide-react';

interface CommunicationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  whatsappConfigured: boolean;
  smsConfigured: boolean;
}

export const CommunicationTabs: React.FC<CommunicationTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  whatsappConfigured, 
  smsConfigured 
}) => {
  return (
    <Tabs defaultValue="whatsapp" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="whatsapp">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span>WhatsApp</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="sms">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <span>SMS</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="voice">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            <span>Voice</span>
          </div>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
