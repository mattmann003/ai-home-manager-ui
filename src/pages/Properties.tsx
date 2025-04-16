
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PropertyCard from '@/components/properties/PropertyCard';
import AddPropertyDialog from '@/components/properties/AddPropertyDialog';
import ImportPropertiesDialog from '@/components/properties/ImportPropertiesDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search, Upload, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { fetchProperties } from '@/integrations/supabase/helpers';

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const { data: properties = [], refetch, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });

  // Transform database properties to the format expected by PropertyCard
  const transformedProperties = properties.map(property => ({
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zip_code,
    type: property.type,
    owner_name: property.owner_name,
    owner_email: property.owner_email,
    owner_phone: property.owner_phone,
    created_at: property.created_at,
    updated_at: property.updated_at,
    // Adding missing required properties with default values
    bedrooms: 0,
    bathrooms: 0,
    image: '',
    assignedHandymen: []
  }));

  const filteredProperties = transformedProperties.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportComplete = () => {
    refetch();
    setImportDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground">Manage your rental properties.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex items-center gap-1"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No properties found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Your First Property
            </Button>
          </div>
        )}
      </div>
      
      <AddPropertyDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
      />
      
      <ImportPropertiesDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
};

export default Properties;
