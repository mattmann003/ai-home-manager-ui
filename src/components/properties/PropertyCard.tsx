
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Property } from '@/data/mockData';
import { Building, MapPin, Users } from 'lucide-react';

type PropertyCardProps = {
  property: Property;
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg truncate">{property.name}</h3>
          <div className="flex items-center text-muted-foreground gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {property.city}, {property.state}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>
                {property.bedrooms} BD • {property.bathrooms} BA
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{property.assignedHandymen.length} Handymen</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          to={`/properties/${property.id}`}
          className="w-full text-center text-sm py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
