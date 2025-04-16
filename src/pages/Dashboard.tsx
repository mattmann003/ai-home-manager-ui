
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import IssueVolumeChart from '@/components/dashboard/IssueVolumeChart';
import HandymanResponseTime from '@/components/dashboard/HandymanResponseTime';
import AiCallLog from '@/components/dashboard/AiCallLog';
import { AlertTriangle, Clock, CheckCircle2, Activity } from 'lucide-react';
import { analyticsData } from '@/data/mockData';

const Dashboard = () => {
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
            value="12"
            icon={<AlertTriangle className="h-4 w-4" />}
            description="4 urgent"
            trend={{ value: 8, isPositive: false }}
          />
          <StatCard
            title="Avg. Resolution Time"
            value="2.5 hrs"
            icon={<Clock className="h-4 w-4" />}
            description="Last 30 days"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Resolution Rate"
            value="94%"
            icon={<CheckCircle2 className="h-4 w-4" />}
            description="Last 30 days"
            trend={{ value: 4, isPositive: true }}
          />
          <StatCard
            title="AI Response Rate"
            value="99.9%"
            icon={<Activity className="h-4 w-4" />}
            description="System uptime"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <IssueVolumeChart />
          <HandymanResponseTime />
        </div>

        <AiCallLog />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
