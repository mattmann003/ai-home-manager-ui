
import DashboardLayout from '@/components/layout/DashboardLayout';
import KnowledgeBaseComponent from '@/components/knowledge/KnowledgeBase';

const KnowledgeBase = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Find answers and learn how to use the system effectively.</p>
        </div>
        
        <KnowledgeBaseComponent />
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;
