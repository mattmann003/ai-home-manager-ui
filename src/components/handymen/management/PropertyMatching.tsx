
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { fetchProperties, fetchHandymanLocations } from '@/integrations/supabase/helpers';
import { Briefcase, Home, Map, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MatchingProperty = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  matchScore: number;
  matchReason: string;
};

type HandymanPropertyMatch = {
  property_id: string;
  handyman_id: string;
  match_score: number;
  is_primary: boolean;
  match_reason: string;
};

const PropertyMatching = ({ handymanId }: { handymanId: string }) => {
  const [selectedTab, setSelectedTab] = useState('assigned');
  const [matchedProperties, setMatchedProperties] = useState<MatchingProperty[]>([]);
  const [suggestedProperties, setSuggestedProperties] = useState<MatchingProperty[]>([]);
  
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });
  
  const { data: locations = [] } = useQuery({
    queryKey: ['handyman-locations', handymanId],
    queryFn: () => fetchHandymanLocations(handymanId)
  });
  
  // Mock function to simulate property-handyman matching algorithm
  // In a real app, this would be a more sophisticated algorithm
  useEffect(() => {
    if (properties.length > 0 && locations.length > 0) {
      // Simple algorithm: assign match scores based on location matches
      const zipCodes = locations
        .filter((l: any) => l.coverage_type === 'zip_code')
        .map((l: any) => l.location_value);
      
      const cities = locations
        .filter((l: any) => l.coverage_type === 'city')
        .map((l: any) => l.location_value.toLowerCase());
      
      const matched: MatchingProperty[] = [];
      const suggested: MatchingProperty[] = [];
      
      properties.forEach((property: any) => {
        let matchScore = 0;
        let matchReason = '';
        
        // Check for zip code match (strongest)
        if (zipCodes.includes(property.zip_code)) {
          matchScore += 80;
          matchReason = 'Direct zip code match';
        }
        // Check for city match (medium)
        else if (cities.includes(property.city.toLowerCase())) {
          matchScore += 60;
          matchReason = 'City coverage match';
        }
        // Proximity match (weakest)
        else {
          // In a real app, would calculate actual distance
          // For demo, use random score based on state match
          if (locations.some((l: any) => l.location_value.toLowerCase().includes(property.state.toLowerCase()))) {
            matchScore += 30;
            matchReason = 'State coverage match';
          } else {
            matchScore += Math.floor(Math.random() * 20);
            matchReason = 'Potential coverage expansion';
          }
        }
        
        // Add skill bonuses (mock)
        matchScore += Math.floor(Math.random() * 10);
        
        const matchProperty = {
          ...property,
          matchScore,
          matchReason
        };
        
        if (matchScore >= 50) {
          matched.push(matchProperty);
        } else {
          suggested.push(matchProperty);
        }
      });
      
      // Sort by match score (descending)
      matched.sort((a, b) => b.matchScore - a.matchScore);
      suggested.sort((a, b) => b.matchScore - a.matchScore);
      
      setMatchedProperties(matched);
      setSuggestedProperties(suggested);
    }
  }, [properties, locations]);
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const getMatchScoreClass = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-blue-100 text-blue-800';
    if (score >= 30) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Properties</p>
                <h3 className="text-2xl font-bold">{matchedProperties.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Map className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coverage Areas</p>
                <h3 className="text-2xl font-bold">{locations.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workload</p>
                <h3 className="text-2xl font-bold">68%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Match Strength</p>
                <h3 className="text-2xl font-bold">73%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Property Matching</CardTitle>
              <CardDescription>
                Properties assigned and recommended for this handyman
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Match Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="assigned">Assigned Properties</TabsTrigger>
              <TabsTrigger value="suggested">Suggested Matches</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assigned" className="space-y-4">
              {matchedProperties.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-xs font-medium text-left p-3">Property</th>
                        <th className="text-xs font-medium text-left p-3">Location</th>
                        <th className="text-xs font-medium text-center p-3">Match Score</th>
                        <th className="text-xs font-medium text-left p-3">Reason</th>
                        <th className="text-xs font-medium text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {matchedProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{property.name}</div>
                            <div className="text-xs text-muted-foreground">{property.address}</div>
                          </td>
                          <td className="p-3">
                            <div>{property.city}, {property.state}</div>
                            <div className="text-xs text-muted-foreground">{property.zip_code}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <span className={`text-xs px-2 py-1 rounded-full ${getMatchScoreClass(property.matchScore)}`}>
                                {property.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {property.matchReason}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Home className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No properties assigned yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Add location coverage areas to automatically match properties.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="suggested" className="space-y-4">
              {suggestedProperties.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-xs font-medium text-left p-3">Property</th>
                        <th className="text-xs font-medium text-left p-3">Location</th>
                        <th className="text-xs font-medium text-center p-3">Match Score</th>
                        <th className="text-xs font-medium text-left p-3">Reason</th>
                        <th className="text-xs font-medium text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {suggestedProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-muted/50">
                          <td className="p-3">
                            <div className="font-medium">{property.name}</div>
                            <div className="text-xs text-muted-foreground">{property.address}</div>
                          </td>
                          <td className="p-3">
                            <div>{property.city}, {property.state}</div>
                            <div className="text-xs text-muted-foreground">{property.zip_code}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <span className={`text-xs px-2 py-1 rounded-full ${getMatchScoreClass(property.matchScore)}`}>
                                {property.matchScore}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {property.matchReason}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="outline" size="sm">
                              Assign
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No suggested properties found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Factors</CardTitle>
            <CardDescription>
              Key factors used in assignment algorithm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Location Proximity</span>
                  <span className="font-medium">High Impact</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Skill Match</span>
                  <span className="font-medium">Medium Impact</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "65%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Workload Balance</span>
                  <span className="font-medium">Medium Impact</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "60%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Property Complexity</span>
                  <span className="font-medium">Low Impact</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "40%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Time</span>
                  <span className="font-medium">Low Impact</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: "30%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Coverage Insights</CardTitle>
            <CardDescription>
              Optimization opportunities for coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-green-800 font-medium mb-1">Strong Match Areas</h4>
                <p className="text-sm text-green-700">
                  This handyman has excellent coverage in Manhattan and Queens with high match scores.
                </p>
              </div>
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-amber-800 font-medium mb-1">Coverage Gap</h4>
                <p className="text-sm text-amber-700">
                  Consider adding Brooklyn (11201) to improve coverage for 5 properties.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-900"
                >
                  Add Coverage
                </Button>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-blue-800 font-medium mb-1">Workload Distribution</h4>
                <p className="text-sm text-blue-700">
                  This handyman has a balanced workload (68%) with capacity for more properties.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyMatching;
