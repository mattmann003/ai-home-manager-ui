
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin, Bed, Bath, Home, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PropertyDetailMaintenanceHistory from '@/components/properties/PropertyDetailMaintenanceHistory';
import PropertyDetailHandymen from '@/components/properties/PropertyDetailHandymen';
import { properties } from '@/data/mockData';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const property = properties.find(property => property.id === id);

  if (!property) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Property Not Found</h1>
            <p className="text-muted-foreground">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/properties">Back to Properties</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/properties">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-sm">
              <div className="aspect-video w-full">
                <img
                  src={property.image}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                      <Bed className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="text-lg font-semibold">{property.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                      <Bath className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="text-lg font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="text-lg font-semibold">Rental</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <PropertyDetailMaintenanceHistory property={property} />
          </div>
          
          <div className="space-y-6">
            <PropertyDetailHandymen property={property} />
            
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-3 rounded-full">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property ID</p>
                    <p className="text-lg font-semibold">#{property.id.split('-')[1]}</p>
                  </div>
                </div>
                <Button className="w-full">Create New Issue</Button>
                <Button variant="outline" className="w-full">Property Settings</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PropertyDetail;
