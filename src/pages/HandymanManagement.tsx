
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HandymanManagement from '@/components/handymen/HandymanManagement';

const HandymanManagementPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No handyman selected.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <HandymanManagement handymanId={id} />
    </DashboardLayout>
  );
};

export default HandymanManagementPage;
