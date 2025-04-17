
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Plus, Trash, Star } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface HandymanProfileProps {
  handyman: any;
}

const AVAILABLE_SPECIALTIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Painting',
  'Flooring',
  'Appliance Repair',
  'Locksmith',
  'Landscaping',
  'Pest Control',
  'Roofing',
  'General Maintenance'
];

const HandymanProfile = ({ handyman }: HandymanProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: handyman.name,
    email: handyman.email,
    phone: handyman.phone || '',
    specialties: handyman.specialties || [],
    hourlyRate: handyman.hourly_rate || '',
    bio: handyman.bio || '',
    availability: handyman.availability || 'Available'
  });
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('handymen')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialties: formData.specialties,
          hourly_rate: formData.hourlyRate || null,
          bio: formData.bio || null,
          availability: formData.availability
        })
        .eq('id', handyman.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: handyman.name,
      email: handyman.email,
      phone: handyman.phone || '',
      specialties: handyman.specialties || [],
      hourlyRate: handyman.hourly_rate || '',
      bio: handyman.bio || '',
      availability: handyman.availability || 'Available'
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Handyman Profile</CardTitle>
            <CardDescription>Personal details and specialties</CardDescription>
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <div className="text-base">{handyman.name}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="text-base">{handyman.email}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              ) : (
                <div className="text-base">{handyman.phone || 'Not provided'}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              {isEditing ? (
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g., 45"
                />
              ) : (
                <div className="text-base">
                  {handyman.hourly_rate ? `$${handyman.hourly_rate}/hour` : 'Not specified'}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Status</Label>
              {isEditing ? (
                <Select
                  value={formData.availability}
                  onValueChange={(value) => handleSelectChange('availability', value)}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="On Vacation">On Vacation</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge className={
                    handyman.availability === 'Available' ? 'bg-green-100 text-green-800' :
                    handyman.availability === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                    handyman.availability === 'On Vacation' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {handyman.availability || 'Available'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Specialties</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Select
                      value={newSpecialty}
                      onValueChange={setNewSpecialty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SPECIALTIES.filter(s => !formData.specialties.includes(s)).map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={handleAddSpecialty} disabled={!newSpecialty}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties.map(specialty => (
                      <Badge key={specialty} className="py-1 px-2 flex items-center gap-1">
                        {specialty}
                        <button
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="text-xs hover:text-destructive transition-colors rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {handyman.specialties && handyman.specialties.length > 0 ? (
                    handyman.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="secondary" className="py-1 px-2">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No specialties specified</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Notes</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Enter notes about this handyman"
                  className="min-h-[120px]"
                />
              ) : (
                <div className="text-sm">
                  {handyman.bio || 'No bio provided'}
                </div>
              )}
            </div>
            
            {!isEditing && handyman.rating && (
              <div className="space-y-2">
                <Label>Performance Rating</Label>
                <div className="flex items-center space-x-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < handyman.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{handyman.rating}/5</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HandymanProfile;
