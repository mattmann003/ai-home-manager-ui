import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHandymanLocations, fetchProperties, HandymanLocation } from '@/integrations/supabase/helpers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { MapPin, Plus, Trash2 } from 'lucide-react';
// Include TS ignore for mapbox-gl if still having issues
// @ts-ignore
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your own Mapbox token or fetch from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZXRva2VuIiwiYSI6ImV4YW1wbGV0b2tlbiJ9.example';

interface LocationFormValues {
  coverage_type: 'zip_code' | 'city' | 'radius';
  location_value: string;
  radius_miles: number;
  is_primary: boolean;
}

const LocationCoverage = ({ handymanId }: { handymanId: string }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formValues, setFormValues] = useState<LocationFormValues>({
    coverage_type: 'zip_code',
    location_value: '',
    radius_miles: 10,
    is_primary: false,
  });
  
  const queryClient = useQueryClient();
  
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['handyman-locations', handymanId],
    queryFn: () => fetchHandymanLocations(handymanId)
  });
  
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties
  });

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 10,
      center: [-73.96, 40.76], // Default to NYC, will update based on locations
    });
    
    map.current.addControl(new mapboxgl.NavigationControl());
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);
  
  // Update map markers when locations change
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    if (locations.length === 0 && properties.length === 0) return;
    
    // Add location markers
    locations.forEach(location => {
      // For demonstration purposes - would need geocoding service 
      // to convert address/zip to coordinates in a real app
      
      // Mock coordinates for demo
      const coords = getMockCoordinates(location.location_value);
      
      const el = document.createElement('div');
      el.className = 'w-6 h-6 bg-primary rounded-full flex items-center justify-center';
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <p><strong>${location.coverage_type}:</strong> ${location.location_value}</p>
          ${location.radius_miles ? `<p>Radius: ${location.radius_miles} miles</p>` : ''}
          <p>${location.is_primary ? 'Primary location' : 'Secondary location'}</p>
        `))
        .addTo(map.current!);
      
      markers.current.push(marker);
      
      // Draw radius circle if applicable
      if (location.coverage_type === 'radius' && location.radius_miles) {
        drawRadiusCircle(coords, location.radius_miles);
      }
    });
    
    // Add property markers with a different color
    properties.forEach(property => {
      // Mock coordinates for demo
      const coords = getMockCoordinates(property.zip_code);
      
      const el = document.createElement('div');
      el.className = 'w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center';
      el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <p><strong>${property.name}</strong></p>
          <p>${property.address}</p>
          <p>${property.city}, ${property.state} ${property.zip_code}</p>
        `))
        .addTo(map.current!);
      
      markers.current.push(marker);
    });
    
    // Fit bounds if we have markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.current.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.current.fitBounds(bounds, { padding: 70 });
    }
  }, [locations, properties]);
  
  // Draw a radius circle on the map
  const drawRadiusCircle = (center: [number, number], radiusMiles: number) => {
    if (!map.current) return;
    
    // Convert miles to kilometers for turf
    const radiusKm = radiusMiles * 1.60934;
    
    // This is simplified - would use turf.js in a real app
    // to draw accurate radius circles
    
    // Mock implementation - just to show the concept
    const circleId = `circle-${center[0]}-${center[1]}-${radiusMiles}`;
    
    if (map.current.getSource(circleId)) return;
    
    map.current.addSource(circleId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {}
      }
    });
    
    map.current.addLayer({
      id: circleId,
      type: 'circle',
      source: circleId,
      paint: {
        'circle-radius': 100 * radiusMiles / 5, // Simplified radius calculation
        'circle-color': '#3B82F6',
        'circle-opacity': 0.2,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#3B82F6'
      }
    });
  };
  
  // Mock function to generate coordinates from location values
  // In a real app, you would use a geocoding service
  const getMockCoordinates = (locationValue: string): [number, number] => {
    // Generate deterministic but random-looking coordinates based on string
    const hash = locationValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Center around NYC area with some variation
    const lng = -74 + (hash % 100) / 100;
    const lat = 40.7 + (hash % 100) / 100;
    
    return [lng, lat];
  };
  
  const handleFormChange = (field: keyof LocationFormValues, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddLocation = async () => {
    try {
      const newLocation = {
        handyman_id: handymanId,
        coverage_type: formValues.coverage_type,
        location_value: formValues.location_value,
        radius_miles: formValues.coverage_type === 'radius' ? formValues.radius_miles : null,
        priority: locations.length + 1,
        is_primary: formValues.is_primary
      };
      
      // Use type assertion to bypass TypeScript's type checking
      const { error } = await (supabase
        .from('handyman_locations') as any)
        .insert(newLocation);
      
      if (error) throw error;
      
      toast.success('Location coverage added successfully');
      queryClient.invalidateQueries({ queryKey: ['handyman-locations', handymanId] });
      
      // Reset form
      setFormValues({
        coverage_type: 'zip_code',
        location_value: '',
        radius_miles: 10,
        is_primary: false,
      });
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error adding location coverage:', error);
      toast.error(error.message || 'Failed to add location coverage');
    }
  };
  
  const handleDeleteLocation = async (locationId: string) => {
    try {
      // Use type assertion to bypass TypeScript's type checking
      const { error } = await (supabase
        .from('handyman_locations') as any)
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
      
      toast.success('Location removed successfully');
      queryClient.invalidateQueries({ queryKey: ['handyman-locations', handymanId] });
    } catch (error: any) {
      console.error('Error removing location:', error);
      toast.error(error.message || 'Failed to remove location');
    }
  };
  
  const calculateCoverageStats = () => {
    // In a real app, would calculate coverage metrics based on properties within service areas
    const totalProperties = properties.length;
    const coveredProperties = Math.min(totalProperties, Math.floor(totalProperties * 0.7));
    const coveragePercentage = totalProperties > 0 ? (coveredProperties / totalProperties) * 100 : 0;
    
    return {
      totalProperties,
      coveredProperties,
      coveragePercentage: Math.round(coveragePercentage)
    };
  };
  
  const stats = calculateCoverageStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Area Map</CardTitle>
            <CardDescription>
              Visual representation of coverage areas and properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapContainer} 
              className="w-full h-[400px] rounded-md border"
            ></div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Coverage Areas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Properties</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Coverage Locations</CardTitle>
                <CardDescription>
                  Manage service areas by zip code, city, or radius
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
              >
                {isAdding ? 'Cancel' : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Location
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isAdding && (
              <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-md">
                <h3 className="font-medium">Add New Coverage Area</h3>
                <RadioGroup 
                  value={formValues.coverage_type}
                  onValueChange={(value) => handleFormChange('coverage_type', value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zip_code" id="zip_code" />
                    <Label htmlFor="zip_code">Zip Code</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="city" id="city" />
                    <Label htmlFor="city">City</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radius" id="radius" />
                    <Label htmlFor="radius">Radius</Label>
                  </div>
                </RadioGroup>
                
                <div className="space-y-2">
                  <Label htmlFor="location_value">
                    {formValues.coverage_type === 'zip_code' ? 'Zip Code' : 
                     formValues.coverage_type === 'city' ? 'City Name' : 
                     'Center Address'}
                  </Label>
                  <Input
                    id="location_value"
                    value={formValues.location_value}
                    onChange={(e) => handleFormChange('location_value', e.target.value)}
                    placeholder={
                      formValues.coverage_type === 'zip_code' ? '10001' : 
                      formValues.coverage_type === 'city' ? 'New York' : 
                      '123 Main St, New York, NY'
                    }
                  />
                </div>
                
                {formValues.coverage_type === 'radius' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="radius_miles">Radius (miles)</Label>
                      <span className="text-sm">{formValues.radius_miles} miles</span>
                    </div>
                    <Slider
                      id="radius_miles"
                      min={1}
                      max={50}
                      step={1}
                      value={[formValues.radius_miles]}
                      onValueChange={(value) => handleFormChange('radius_miles', value[0])}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formValues.is_primary}
                    onChange={(e) => handleFormChange('is_primary', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_primary">Set as primary service area</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLocation} disabled={!formValues.location_value}>
                    Add Location
                  </Button>
                </div>
              </div>
            )}
            
            {isLoadingLocations ? (
              <div className="space-y-2">
                <div className="h-12 bg-muted rounded-md animate-pulse"></div>
                <div className="h-12 bg-muted rounded-md animate-pulse"></div>
              </div>
            ) : locations.length > 0 ? (
              <div className="space-y-3">
                {locations.map((location: HandymanLocation) => (
                  <div 
                    key={location.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          {location.coverage_type === 'zip_code' ? 'Zip Code' : 
                           location.coverage_type === 'city' ? 'City' : 'Radius'}:
                          {' '}{location.location_value}
                          {location.is_primary && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {location.coverage_type === 'radius' ? 
                            `${location.radius_miles} mile radius` : 
                            `Priority: ${location.priority}`
                          }
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No coverage areas defined yet.</p>
                <p className="text-sm text-muted-foreground">
                  Add locations to define where this handyman provides service.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage Statistics</CardTitle>
            <CardDescription>
              Analysis of service area coverage and property matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Properties in Portfolio:</span>
                  <span className="font-medium">{stats.totalProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Properties Covered:</span>
                  <span className="font-medium">{stats.coveredProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Coverage Percentage:</span>
                  <span className="font-medium">{stats.coveragePercentage}%</span>
                </div>
              </div>
              
              <div className="w-full bg-muted/30 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${stats.coveragePercentage}%` }}
                ></div>
              </div>
              
              <div className="pt-4 space-y-4">
                <h4 className="text-sm font-medium">Coverage Areas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-2xl font-semibold">{locations.filter(l => l.coverage_type === 'zip_code').length}</div>
                    <div className="text-sm text-muted-foreground">Zip Codes</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-2xl font-semibold">{locations.filter(l => l.coverage_type === 'city').length}</div>
                    <div className="text-sm text-muted-foreground">Cities</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-2xl font-semibold">{locations.filter(l => l.coverage_type === 'radius').length}</div>
                    <div className="text-sm text-muted-foreground">Radius Areas</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-2xl font-semibold">{locations.filter(l => l.is_primary).length}</div>
                    <div className="text-sm text-muted-foreground">Primary Areas</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Coverage Optimization</CardTitle>
            <CardDescription>
              Suggestions to improve service area coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-amber-800 font-medium mb-1">Coverage Gap Detected</h4>
                <p className="text-sm text-amber-700">
                  There are 3 properties in the Manhattan area without coverage.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-amber-800 border-amber-300 hover:bg-amber-100 hover:text-amber-900"
                >
                  Add Manhattan Coverage
                </Button>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-green-800 font-medium mb-1">Potential Optimization</h4>
                <p className="text-sm text-green-700">
                  A 15-mile radius from Brooklyn would cover 5 additional properties.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-green-800 border-green-300 hover:bg-green-100 hover:text-green-900"
                >
                  Apply Suggestion
                </Button>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-blue-800 font-medium mb-1">Overlapping Coverage</h4>
                <p className="text-sm text-blue-700">
                  2 handymen cover the Queens area. Consider adjusting priorities.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-blue-800 border-blue-300 hover:bg-blue-100 hover:text-blue-900"
                >
                  Review Overlap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationCoverage;
