
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Check, X, Home, MapPin, AlertCircle, Wrench } from 'lucide-react';
import { fetchProperties, fetchHandymanLocations } from '@/integrations/supabase/helpers';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface PropertyMatchingProps {
  handymanId: string;
}

const PropertyMatching = ({ handymanId }: PropertyMatchingProps) => {
  const [selectedTab, setSelectedTab] = useState('matching');
  
  const { data: handymanLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['handyman-locations', handymanId],
    queryFn: () => fetchHandymanLocations(handymanId)
  });
  
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });
  
  const { data: assignments = [], isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: ['handyman-properties', handymanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_handymen')
        .select('property_id')
        .eq('handyman_id', handymanId);
      
      if (error) {
        console.error('Error fetching handyman property assignments:', error);
        toast.error('Failed to load property assignments');
        return [];
      }
      
      return data || [];
    }
  });
  
  const assignedPropertyIds = assignments.map(a => a.property_id);
  
  const isPropertyInCoverage = (property: any) => {
    if (!handymanLocations.length) return false;
    
    // Check if property is in any of the handyman's coverage zones
    return handymanLocations.some(location => {
      if (location.coverage_type === 'zip_code') {
        return property.zip_code === location.location_value;
      } else if (location.coverage_type === 'city') {
        return property.city === location.location_value;
      } else if (location.coverage_type === 'radius') {
        // For radius, this would require geocoding calculations
        // This is a simplified check - in a real app, you would calculate distance
        return property.city === location.location_value;
      }
      return false;
    });
  };
  
  const handleAssignProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('property_handymen')
        .insert({
          handyman_id: handymanId,
          property_id: propertyId
        });
      
      if (error) throw error;
      
      toast.success('Property assigned successfully');
      refetchAssignments();
    } catch (error) {
      console.error('Error assigning property:', error);
      toast.error('Failed to assign property');
    }
  };
  
  const handleRemoveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('property_handymen')
        .delete()
        .eq('handyman_id', handymanId)
        .eq('property_id', propertyId);
      
      if (error) throw error;
      
      toast.success('Property assignment removed');
      refetchAssignments();
    } catch (error) {
      console.error('Error removing property assignment:', error);
      toast.error('Failed to remove property assignment');
    }
  };
  
  const isLoading = locationsLoading || propertiesLoading || assignmentsLoading;
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-32 mx-auto bg-muted rounded-md animate-pulse"></div>
              <div className="mt-4 h-4 w-48 mx-auto bg-muted rounded-md animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Assignments</CardTitle>
        <CardDescription>
          Manage property assignments and view service area matches
        </CardDescription>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matching">Coverage Matching</TabsTrigger>
            <TabsTrigger value="assigned">Assigned Properties</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="matching" className="p-0 mt-6">
          <div className="px-6 mb-4">
            <p className="text-sm text-muted-foreground">
              Properties that match with this handyman's service area based on location coverage settings.
            </p>
          </div>
          
          <Separator />
          
          <div className="divide-y">
            {properties.length === 0 ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">No properties found</p>
              </div>
            ) : (
              properties.map(property => {
                const isInCoverage = isPropertyInCoverage(property);
                const isAssigned = assignedPropertyIds.includes(property.id);
                
                return (
                  <div key={property.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{property.name}</span>
                        {isInCoverage && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            In Coverage
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </div>
                    </div>
                    
                    <div>
                      {isAssigned ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveProperty(property.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAssignProperty(property.id)}
                          disabled={!isInCoverage}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="assigned" className="p-0 mt-6">
          <div className="px-6 mb-4">
            <p className="text-sm text-muted-foreground">
              Properties this handyman is currently assigned to service.
            </p>
          </div>
          
          <Separator />
          
          <div className="divide-y">
            {assignedPropertyIds.length === 0 ? (
              <div className="p-6 text-center">
                <Wrench className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">No assigned properties</p>
              </div>
            ) : (
              properties
                .filter(property => assignedPropertyIds.includes(property.id))
                .map(property => (
                  <div key={property.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{property.name}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveProperty(property.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PropertyMatching;
