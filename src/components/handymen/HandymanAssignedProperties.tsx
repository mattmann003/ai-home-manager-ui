
import { Link } from 'react-router-dom';
import { Handyman, properties } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

type HandymanAssignedPropertiesProps = {
  handyman: Handyman;
};

const HandymanAssignedProperties = ({ handyman }: HandymanAssignedPropertiesProps) => {
  const assignedProperties = properties.filter(property => 
    handyman.assignedProperties.includes(property.id)
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Assigned Properties</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-xs font-medium text-left p-4">Property</th>
                <th className="text-xs font-medium text-center p-4">Size</th>
                <th className="text-xs font-medium text-center p-4">Address</th>
                <th className="text-xs font-medium text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignedProperties.length > 0 ? (
                assignedProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img
                            src={property.image}
                            alt={property.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium">{property.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-muted-foreground">
                        {property.bedrooms} BD • {property.bathrooms} BA
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-muted-foreground">
                        {property.city}, {property.state}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/properties/${property.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-4">
                      <Home className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No properties assigned yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default HandymanAssignedProperties;
