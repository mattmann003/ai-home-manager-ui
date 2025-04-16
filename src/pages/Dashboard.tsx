
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import IssueVolumeChart from '@/components/dashboard/IssueVolumeChart';
import HandymanResponseTime from '@/components/dashboard/HandymanResponseTime';
import AiCallLog from '@/components/dashboard/AiCallLog';
import { AlertTriangle, Clock, CheckCircle2, Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAiCalls } from '@/integrations/supabase/helpers';
import { toast } from '@/components/ui/sonner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    openIssues: 0,
    urgentIssues: 0,
    avgResolutionTime: 0,
    resolutionRate: 0,
    aiResponseRate: 99.9
  });
  const [aiCalls, setAiCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch open issues count
        const { count: openCount, error: openError } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Open');
        
        if (openError) throw openError;

        // Fetch urgent issues count
        const { count: urgentCount, error: urgentError } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Open')
          .eq('priority', 'Urgent');
        
        if (urgentError) throw urgentError;

        // Calculate resolution rate
        const { data: resolvedIssues, error: resolvedError } = await supabase
          .from('issues')
          .select('*', { count: 'exact' })
          .eq('status', 'Resolved');
        
        if (resolvedError) throw resolvedError;

        const { count: totalIssues, error: totalError } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;

        const resolutionRate = totalIssues ? Math.round((resolvedIssues.length / totalIssues) * 100) : 0;

        // Calculate average resolution time (simplified)
        const avgResolutionHours = 2.5; // In a real app, you would calculate this from the data

        // Fetch recent AI calls
        const recentAiCalls = await fetchAiCalls();

        setStats({
          openIssues: openCount || 0,
          urgentIssues: urgentCount || 0,
          avgResolutionTime: avgResolutionHours,
          resolutionRate,
          aiResponseRate: 99.9 // This could be calculated from AI call success rate
        });

        setAiCalls(recentAiCalls);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Set up real-time subscription for issues
    const issuesChannel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    // Set up real-time subscription for AI calls
    const aiCallsChannel = supabase
      .channel('ai-calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_calls'
        },
        async () => {
          const refreshedCalls = await fetchAiCalls();
          setAiCalls(refreshedCalls);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(issuesChannel);
      supabase.removeChannel(aiCallsChannel);
    };
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to AI Maintenance Assistant.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Open Issues"
            value={stats.openIssues.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            description={`${stats.urgentIssues} urgent`}
            trend={{ value: 8, isPositive: false }}
          />
          <StatCard
            title="Avg. Resolution Time"
            value={`${stats.avgResolutionTime} hrs`}
            icon={<Clock className="h-4 w-4" />}
            description="Last 30 days"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            icon={<CheckCircle2 className="h-4 w-4" />}
            description="Last 30 days"
            trend={{ value: 4, isPositive: true }}
          />
          <StatCard
            title="AI Response Rate"
            value={`${stats.aiResponseRate}%`}
            icon={<Activity className="h-4 w-4" />}
            description="System uptime"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <IssueVolumeChart />
          <HandymanResponseTime />
        </div>

        <AiCallLog aiCalls={aiCalls} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
