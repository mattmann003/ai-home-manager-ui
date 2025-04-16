
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IssuesPerPropertyChart from '@/components/analytics/IssuesPerPropertyChart';
import CommonIssuesChart from '@/components/analytics/CommonIssuesChart';
import ResponseTimeChart from '@/components/analytics/ResponseTimeChart';
import AiCallAnalyticsChart from '@/components/analytics/AiCallAnalyticsChart';
import AiResolutionChart from '@/components/analytics/AiResolutionChart';
import AiCallDurationChart from '@/components/analytics/AiCallDurationChart';
import { fetchAiCalls } from '@/integrations/supabase/helpers';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const Analytics = () => {
  const [aiCalls, setAiCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("property");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const aiCallsData = await fetchAiCalls();
        setAiCalls(aiCallsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading analytics data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Insights and statistics about properties, issues, and AI interactions.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="property">Property Insights</TabsTrigger>
            <TabsTrigger value="ai">AI Interactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="property" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IssuesPerPropertyChart />
              <CommonIssuesChart />
            </div>
            <div>
              <ResponseTimeChart />
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AiCallAnalyticsChart aiCalls={aiCalls} />
              <AiResolutionChart aiCalls={aiCalls} />
            </div>
            <div>
              <AiCallDurationChart aiCalls={aiCalls} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
