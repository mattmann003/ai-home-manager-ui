
import { AlertCircle, Clock, HomeIcon, Wrench } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import IssueVolumeChart from '@/components/dashboard/IssueVolumeChart';
import HandymanResponseTime from '@/components/dashboard/HandymanResponseTime';
import AiCallLog from '@/components/dashboard/AiCallLog';
import { issues } from '@/data/mockData';

const Dashboard = () => {
  // Calculate stats from mock data
  const openIssuesCount = issues.filter(issue => issue.status === 'Open').length;
  const inProgressIssuesCount = issues.filter(issue => issue.status === 'In Progress').length;
  
  // Calculate average resolution time (mock value)
  const avgResolutionTime = '28h 15m';
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your properties and maintenance issues.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Open Issues" 
            value={openIssuesCount} 
            icon={<AlertCircle className="h-5 w-5" />}
            description="Awaiting assignment"
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard 
            title="In Progress" 
            value={inProgressIssuesCount} 
            icon={<Wrench className="h-5 w-5" />}
            description="Currently being handled"
          />
          <StatCard 
            title="Avg. Resolution Time" 
            value={avgResolutionTime} 
            icon={<Clock className="h-5 w-5" />}
            description="Last 30 days"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="Total Properties" 
            value="5" 
            icon={<HomeIcon className="h-5 w-5" />}
            description="Active properties"
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <IssueVolumeChart />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <HandymanResponseTime />
          </div>
        </div>
        
        <div>
          <AiCallLog />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
