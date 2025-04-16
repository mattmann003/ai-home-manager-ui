
import { Link } from 'react-router-dom';
import { Property, getStatusColorClass, formatDate } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

type PropertyDetailMaintenanceHistoryProps = {
  property: Property;
};

const PropertyDetailMaintenanceHistory = ({ property }: PropertyDetailMaintenanceHistoryProps) => {
  if (!property.maintenanceHistory || property.maintenanceHistory.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Maintenance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No maintenance history available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Maintenance History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-xs font-medium text-left p-4">Issue</th>
                <th className="text-xs font-medium text-center p-4">Date</th>
                <th className="text-xs font-medium text-center p-4">Status</th>
                <th className="text-xs font-medium text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {property.maintenanceHistory.map((item) => (
                <tr key={item.issueId} className="hover:bg-muted/50">
                  <td className="p-4">
                    <span className="text-sm font-medium">{item.title}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={getStatusColorClass(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/issues/${item.issueId}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailMaintenanceHistory;
