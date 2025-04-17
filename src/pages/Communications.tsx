
import DashboardLayout from '@/components/layout/DashboardLayout';
import CommunicationsDashboard from '@/components/communications/CommunicationsDashboard';
import { motion } from 'framer-motion';

const Communications = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CommunicationsDashboard />
      </motion.div>
    </DashboardLayout>
  );
};

export default Communications;
