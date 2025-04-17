
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { MapPin, Plus, Save, Trash } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchHandymanLocations, addHandymanLocation, updateHandymanLocation, deleteHandymanLocation, HandymanLocation } from '@/integrations/supabase/helpers';
import { useQuery } from '@tanstack/react-query';

// Mapbox access token - typically would be in an environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNscXJlMTVjdTJibHAya3BhMGVnbXYyYWQifQ.a88q0rXbQwrwkYwFNNyYlA';

interface LocationCoverageProps {
  handymanId: string;
}

const LocationCoverage = ({ handymanId }: LocationCoverageProps) => {
  const [selectedTab, setSelectedTab] = useState('locations');
  const [coverageType, setCoverageType] = useState<'zip_code' | 'city' | 'radius'>('zip_code');
  const [locationValue, setLocationValue] = useState('');
  const [radius, setRadius] = useState(10);
  const [priority, setPriority] = useState(1);
  const [isPrimary, setIsPrimary] = useState(false);
  const [newLocation, setNewLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<HandymanLocation | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const { data: locations, isLoading, refetch } = useQuery({
    queryKey: ['handyman-locations', handymanId],
    queryFn: () => fetchHandymanLocations(handymanId)
  });

  // Initialize map when the component mounts
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795, 39.8283], // Center of the US
        zoom: 3
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Cleanup on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, []);

  // Add markers when locations data changes
  useEffect(() => {
    if (map.current && locations) {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add markers for each location
      locations.forEach(location => {
        // For simplicity, we'll use a geocoding service to convert addresses to coordinates
        // In a real app, you'd want to cache these results
        if (location.coverage_type === 'zip_code' || location.coverage_type === 'city') {
          const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.location_value)}.json?access_token=${MAPBOX_TOKEN}`;
          
          fetch(geocodingUrl)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                const color = location.is_primary ? '#ef4444' : '#3b82f6';
                
                const marker = new mapboxgl.Marker({ color })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setHTML(`
                    <h3>${location.location_value}</h3>
                    <p>Type: ${location.coverage_type === 'zip_code' ? 'ZIP Code' : 'City'}</p>
                    <p>Priority: ${location.priority}</p>
                    <p>${location.is_primary ? 'Primary' : 'Secondary'}</p>
                  `))
                  .addTo(map.current!);
                
                markers.current.push(marker);
                
                // If it's the primary location, center the map on it
                if (location.is_primary && markers.current.length === 1) {
                  map.current!.flyTo({
                    center: [lng, lat],
                    zoom: location.coverage_type === 'zip_code' ? 10 : 8,
                    essential: true
                  });
                }
              }
            })
            .catch(error => console.error('Error geocoding location:', error));
        } else if (location.coverage_type === 'radius') {
          const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.location_value)}.json?access_token=${MAPBOX_TOKEN}`;
          
          fetch(geocodingUrl)
            .then(response => response.json())
            .then(data => {
              if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                const color = location.is_primary ? '#ef4444' : '#3b82f6';
                
                // Add marker
                const marker = new mapboxgl.Marker({ color })
                  .setLngLat([lng, lat])
                  .setPopup(new mapboxgl.Popup().setHTML(`
                    <h3>${location.location_value}</h3>
                    <p>Radius: ${location.radius_miles} miles</p>
                    <p>Priority: ${location.priority}</p>
                    <p>${location.is_primary ? 'Primary' : 'Secondary'}</p>
                  `))
                  .addTo(map.current!);
                
                markers.current.push(marker);
                
                // Add circle for radius
                if (map.current!.getSource(`radius-${location.id}`)) {
                  (map.current!.getSource(`radius-${location.id}`) as mapboxgl.GeoJSONSource).setData({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: [lng, lat]
                    },
                    properties: {}
                  });
                } else {
                  map.current!.on('load', () => {
                    // Convert miles to km, then to meters for the circle radius
                    const radiusInMeters = location.radius_miles! * 1609.34;
                    
                    map.current!.addSource(`radius-${location.id}`, {
                      type: 'geojson',
                      data: {
                        type: 'Feature',
                        geometry: {
                          type: 'Point',
                          coordinates: [lng, lat]
                        },
                        properties: {}
                      }
                    });
                    
                    map.current!.addLayer({
                      id: `radius-${location.id}`,
                      type: 'circle',
                      source: `radius-${location.id}`,
                      paint: {
                        'circle-radius': {
                          stops: [
                            [0, 0],
                            [20, radiusInMeters / 50]
                          ],
                          base: 2
                        },
                        'circle-color': color,
                        'circle-opacity': 0.2,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': color
                      }
                    });
                  });
                }
                
                // If it's the primary location, center the map on it
                if (location.is_primary && markers.current.length === 1) {
                  map.current!.flyTo({
                    center: [lng, lat],
                    zoom: 8,
                    essential: true
                  });
                }
              }
            })
            .catch(error => console.error('Error geocoding location:', error));
        }
      });
    }
  }, [locations]);

  const handleAddLocation = async () => {
    if (!locationValue) {
      toast.error("Please enter a location value");
      return;
    }

    const locationData: Omit<HandymanLocation, 'id'> = {
      handyman_id: handymanId,
      coverage_type: coverageType,
      location_value: locationValue,
      radius_miles: coverageType === 'radius' ? radius : undefined,
      priority,
      is_primary: isPrimary
    };

    try {
      const { success, error } = await addHandymanLocation(locationData);
      
      if (success) {
        toast.success("Location added successfully");
        // Reset form
        setLocationValue('');
        setCoverageType('zip_code');
        setRadius(10);
        setPriority(1);
        setIsPrimary(false);
        setNewLocation(false);
        
        // Refresh locations
        refetch();
      } else {
        toast.error(error || "Failed to add location");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return;

    const locationData: Partial<HandymanLocation> = {
      coverage_type: coverageType,
      location_value: locationValue,
      radius_miles: coverageType === 'radius' ? radius : undefined,
      priority,
      is_primary: isPrimary
    };

    try {
      const { success, error } = await updateHandymanLocation(selectedLocation.id, locationData);
      
      if (success) {
        toast.success("Location updated successfully");
        setSelectedLocation(null);
        setNewLocation(false);
        
        // Refresh locations
        refetch();
      } else {
        toast.error(error || "Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const { success, error } = await deleteHandymanLocation(locationId);
      
      if (success) {
        toast.success("Location deleted successfully");
        setSelectedLocation(null);
        
        // Refresh locations
        refetch();
      } else {
        toast.error(error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleSelectLocation = (location: HandymanLocation) => {
    setSelectedLocation(location);
    setCoverageType(location.coverage_type);
    setLocationValue(location.location_value);
    setRadius(location.radius_miles || 10);
    setPriority(location.priority);
    setIsPrimary(location.is_primary);
    setNewLocation(true);
  };

  const handleCancelEdit = () => {
    setSelectedLocation(null);
    setLocationValue('');
    setCoverageType('zip_code');
    setRadius(10);
    setPriority(1);
    setIsPrimary(false);
    setNewLocation(false);
  };

  const getCoverageTypeBadge = (type: string) => {
    switch (type) {
      case 'zip_code':
        return <Badge className="bg-blue-100 text-blue-800">ZIP Code</Badge>;
      case 'city':
        return <Badge className="bg-green-100 text-green-800">City</Badge>;
      case 'radius':
        return <Badge className="bg-purple-100 text-purple-800">Radius</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Service Area Coverage</CardTitle>
              <CardDescription>Manage where the handyman provides service</CardDescription>
            </div>
            {!newLocation ? (
              <Button onClick={() => setNewLocation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="locations">
                Location List
              </TabsTrigger>
              <TabsTrigger value="map">
                Coverage Map
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="locations">
              {newLocation ? (
                <div className="border rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium mb-4">
                    {selectedLocation ? 'Edit Location' : 'Add New Location'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coverage-type">Coverage Type</Label>
                        <Select
                          value={coverageType}
                          onValueChange={(value) => setCoverageType(value as any)}
                        >
                          <SelectTrigger id="coverage-type">
                            <SelectValue placeholder="Select coverage type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zip_code">ZIP Code</SelectItem>
                            <SelectItem value="city">City</SelectItem>
                            <SelectItem value="radius">Radius</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location-value">
                          {coverageType === 'zip_code' ? 'ZIP Code' : 
                           coverageType === 'city' ? 'City Name' : 
                           'Center Location'}
                        </Label>
                        <Input
                          id="location-value"
                          value={locationValue}
                          onChange={(e) => setLocationValue(e.target.value)}
                          placeholder={
                            coverageType === 'zip_code' ? 'e.g., 90210' : 
                            coverageType === 'city' ? 'e.g., Los Angeles, CA' : 
                            'e.g., San Francisco, CA'
                          }
                        />
                      </div>
                    </div>
                    
                    {coverageType === 'radius' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="radius">Radius (miles)</Label>
                          <span className="text-sm">{radius} miles</span>
                        </div>
                        <Slider
                          id="radius"
                          value={[radius]}
                          min={1}
                          max={50}
                          step={1}
                          onValueChange={(value) => setRadius(value[0])}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={priority.toString()}
                          onValueChange={(value) => setPriority(parseInt(value))}
                        >
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Highest)</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5 (Lowest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2 h-full pt-6">
                        <Switch
                          id="is-primary"
                          checked={isPrimary}
                          onCheckedChange={setIsPrimary}
                        />
                        <Label htmlFor="is-primary">
                          Primary service area
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    {selectedLocation && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteLocation(selectedLocation.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                    <Button
                      onClick={selectedLocation ? handleUpdateLocation : handleAddLocation}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {selectedLocation ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : null}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span className="ml-2">Loading locations...</span>
                </div>
              ) : locations && locations.length > 0 ? (
                <div className="space-y-2">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="border rounded-md p-4 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <MapPin className={`h-5 w-5 mr-2 ${location.is_primary ? 'text-red-500' : 'text-blue-500'}`} />
                          <div>
                            <h4 className="font-medium">{location.location_value}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {getCoverageTypeBadge(location.coverage_type)}
                              {location.coverage_type === 'radius' && (
                                <Badge className="bg-gray-100 text-gray-800">{location.radius_miles} miles</Badge>
                              )}
                              <Badge className="bg-gray-100 text-gray-800">Priority: {location.priority}</Badge>
                              {location.is_primary && (
                                <Badge className="bg-red-100 text-red-800">Primary</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No locations defined yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setNewLocation(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map">
              <div className="border rounded-md overflow-hidden" style={{ height: '400px' }}>
                <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-800 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div>
                  Primary Location
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
                  Secondary Location
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 flex items-center">
                  <div className="w-3 h-3 rounded-full opacity-20 bg-purple-600 mr-1"></div>
                  Radius Coverage
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationCoverage;
