
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PropertyCard from '@/components/properties/PropertyCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import AddPropertyDialog from '@/components/properties/AddPropertyDialog';
import PropertyCSVUpload from '@/components/properties/PropertyCSVUpload';
import { fetchProperties } from '@/integrations/supabase/helpers';
import { Property } from '@/data/mockData';

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: propertiesData = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });

  // Map Supabase properties to the expected Property type
  const properties: Property[] = propertiesData.map(prop => ({
    id: prop.id,
    name: prop.name,
    address: prop.address,
    city: prop.city,
    state: prop.state,
    zipCode: prop.zip_code, // Convert snake_case to camelCase
    bedrooms: 0, // Default values for missing fields
    bathrooms: 0,
    image: "/placeholder.svg", // Default image
    assignedHandymen: [], // Empty array as default
    // Add any additional fields needed to satisfy the Property type
  }));

  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">Manage your rental properties.</p>
          </div>
          <div className="flex gap-2">
            <PropertyCSVUpload />
            <AddPropertyDialog />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search properties..."
              className="w-full rounded-md pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No properties found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Properties;
