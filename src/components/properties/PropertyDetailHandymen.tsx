
import { Link } from 'react-router-dom';
import { Property, handymen } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

type PropertyDetailHandymenProps = {
  property: Property;
};

const PropertyDetailHandymen = ({ property }: PropertyDetailHandymenProps) => {
  const assignedHandymen = handymen.filter(handyman => 
    property.assignedHandymen.includes(handyman.id)
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Assigned Handymen</CardTitle>
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" />
          <span>Assign</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {assignedHandymen.length > 0 ? (
            assignedHandymen.map(handyman => (
              <div key={handyman.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={handyman.image} alt={handyman.name} />
                    <AvatarFallback>{handyman.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{handyman.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {handyman.specialties.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      handyman.availability === 'Available'
                        ? 'bg-success/10 text-success'
                        : handyman.availability === 'Busy'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {handyman.availability}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/handymen/${handyman.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No handymen assigned yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailHandymen;
