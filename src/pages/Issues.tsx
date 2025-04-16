
import DashboardLayout from '@/components/layout/DashboardLayout';
import IssuesTable from '@/components/issues/IssuesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Issues = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
            <p className="text-muted-foreground">Manage and track all maintenance issues.</p>
          </div>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>New Issue</span>
          </Button>
        </div>
        
        <IssuesTable />
      </div>
    </DashboardLayout>
  );
};

export default Issues;
