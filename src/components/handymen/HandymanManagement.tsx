
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import HandymanProfile from './management/HandymanProfile';
import LocationCoverage from './management/LocationCoverage';
import AvailabilityCalendar from './management/AvailabilityCalendar';
import PropertyMatching from './management/PropertyMatching';
import { useQuery } from '@tanstack/react-query';
import { fetchHandymen } from '@/integrations/supabase/helpers';

interface HandymanManagementProps {
  handymanId: string;
}

const HandymanManagement = ({ handymanId }: HandymanManagementProps) => {
  const [selectedTab, setSelectedTab] = useState('profile');

  const { data: handymen, isLoading } = useQuery({
    queryKey: ['handymen'],
    queryFn: fetchHandymen
  });

  const handyman = handymen?.find(h => h.id === handymanId);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted rounded-md animate-pulse"></div>
        <div className="h-6 w-48 bg-muted rounded-md animate-pulse"></div>
        <div className="h-[400px] bg-muted rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (!handyman) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Handyman Management</h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Handyman not found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Handyman Management</h2>
        <p className="text-muted-foreground">
          Manage {handyman.name}'s profile, location coverage, and availability
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="coverage">Location Coverage</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="matching">Property Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <HandymanProfile handyman={handyman} />
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <LocationCoverage handymanId={handyman.id} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <AvailabilityCalendar handymanId={handyman.id} />
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <PropertyMatching handymanId={handyman.id} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default HandymanManagement;
