
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, Tool, Clock, Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProperties, fetchHandymanLocations, fetchDispatchAssignments } from '@/integrations/supabase/helpers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface PropertyMatchingProps {
  handymanId: string;
}

interface MatchedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  matchStrength: number;
  distanceScore: number;
  skillScore: number;
  workloadScore: number;
}

const PropertyMatching = ({ handymanId }: PropertyMatchingProps) => {
  const [selectedTab, setSelectedTab] = useState('recommendations');
  const [matchedProperties, setMatchedProperties] = useState<MatchedProperty[]>([]);
  const [assignedProperties, setAssignedProperties] = useState<string[]>([]);

  // Fetch properties and handyman locations
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });

  const { data: handymanLocations } = useQuery({
    queryKey: ['handyman-locations', handymanId],
    queryFn: () => fetchHandymanLocations(handymanId)
  });

  const { data: handyman } = useQuery({
    queryKey: ['handyman', handymanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('handymen')
        .select('*')
        .eq('id', handymanId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: propertyAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['property-handymen', handymanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_handymen')
        .select('property_id')
        .eq('handyman_id', handymanId);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch completed jobs for workload calculation
  const { data: completedJobs } = useQuery({
    queryKey: ['completed-jobs', handymanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('property_id')
        .eq('handyman_id', handymanId)
        .eq('status', 'Resolved');
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate property matches when data is available
  useEffect(() => {
    if (properties && handymanLocations && handyman && propertyAssignments && completedJobs) {
      // Get list of already assigned property IDs
      const assignedPropertyIds = propertyAssignments.map(item => item.property_id);
      setAssignedProperties(assignedPropertyIds);

      // Filter out already assigned properties
      const unassignedProperties = properties.filter(property => 
        !assignedPropertyIds.includes(property.id)
      );

      // Calculate workload per property (for workload balancing)
      const jobsPerProperty = completedJobs.reduce((acc: Record<string, number>, job) => {
        acc[job.property_id] = (acc[job.property_id] || 0) + 1;
        return acc;
      }, {});

      // Calculate match strength for each property
      const matches = unassignedProperties.map(property => {
        // Distance score: Check if property is in handyman's service area
        let distanceScore = 0;
        
        if (handymanLocations) {
          for (const location of handymanLocations) {
            if (location.coverage_type === 'zip_code' && property.zip_code === location.location_value) {
              distanceScore = 100 - (location.priority - 1) * 10;
              break;
            }
            
            if (location.coverage_type === 'city' && 
                `${property.city}, ${property.state}`.toLowerCase() === location.location_value.toLowerCase()) {
              distanceScore = 90 - (location.priority - 1) * 10;
              break;
            }
            
            // For radius, we'd need actual geocoding to calculate
            // This is simplified for demonstration
            if (location.coverage_type === 'radius') {
              distanceScore = 70 - (location.priority - 1) * 10;
            }
          }
        }
        
        // Skill score: Based on handyman specialties
        // This is simplified - would normally match property needs with handyman skills
        const skillScore = handyman.specialties ? 
          (handyman.specialties.length / 5) * 100 : 50;
        
        // Workload score: Inverse of number of jobs already done at this property
        const workloadScore = 100 - (jobsPerProperty[property.id] || 0) * 5;
        
        // Overall match strength (weighted average)
        const matchStrength = (
          (distanceScore * 0.6) + 
          (skillScore * 0.3) + 
          (workloadScore * 0.1)
        );
        
        return {
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zip_code,
          matchStrength,
          distanceScore,
          skillScore,
          workloadScore
        };
      });
      
      // Sort by match strength and take top matches
      const sortedMatches = matches.sort((a, b) => b.matchStrength - a.matchStrength);
      setMatchedProperties(sortedMatches);
    }
  }, [properties, handymanLocations, handyman, propertyAssignments, completedJobs]);

  const handleAssignProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('property_handymen')
        .insert({
          property_id: propertyId,
          handyman_id: handymanId
        });
      
      if (error) throw error;
      
      toast.success("Property assigned successfully");
      refetchAssignments();
    } catch (error) {
      console.error("Error assigning property:", error);
      toast.error("Failed to assign property");
    }
  };

  const handleUnassignProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('property_handymen')
        .delete()
        .eq('property_id', propertyId)
        .eq('handyman_id', handymanId);
      
      if (error) throw error;
      
      toast.success("Property unassigned successfully");
      refetchAssignments();
    } catch (error) {
      console.error("Error unassigning property:", error);
      toast.error("Failed to unassign property");
    }
  };

  const getMatchStrengthColor = (strength: number) => {
    if (strength >= 80) return "bg-green-100 text-green-800";
    if (strength >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return "★★★★★";
    if (score >= 60) return "★★★★☆";
    if (score >= 40) return "★★★☆☆";
    if (score >= 20) return "★★☆☆☆";
    return "★☆☆☆☆";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Matching</CardTitle>
        <CardDescription>Assign properties to this handyman based on location and skills</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="assigned">Assigned Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="mt-4">
            {matchedProperties.length > 0 ? (
              <div className="space-y-4">
                {matchedProperties.map((property) => (
                  <div key={property.id} className="border rounded-md p-4">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg">{property.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            {property.address}, {property.city}, {property.state} {property.zipCode}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getMatchStrengthColor(property.matchStrength)}>
                          {Math.round(property.matchStrength)}% Match
                        </Badge>
                        <Button 
                          size="sm"
                          onClick={() => handleAssignProperty(property.id)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Distance</div>
                          <div className="text-sm">{getScoreIcon(property.distanceScore)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tool className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Skills</div>
                          <div className="text-sm">{getScoreIcon(property.skillScore)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-xs text-muted-foreground">Workload</div>
                          <div className="text-sm">{getScoreIcon(property.workloadScore)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No property recommendations available</p>
                <p className="text-sm text-muted-foreground mt-1">Try adding service areas for this handyman</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assigned" className="mt-4">
            {properties && assignedProperties.length > 0 ? (
              <div className="space-y-4">
                {properties
                  .filter(property => assignedProperties.includes(property.id))
                  .map(property => (
                    <div key={property.id} className="border rounded-md p-4">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg">{property.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {property.address}, {property.city}, {property.state} {property.zip_code}
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleUnassignProperty(property.id)}
                        >
                          Unassign
                        </Button>
                      </div>
                      
                      {/* We could add additional information about jobs performed, etc. here */}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No properties assigned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check the recommendations tab to assign properties
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PropertyMatching;
