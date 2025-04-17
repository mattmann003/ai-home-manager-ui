
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Star, Briefcase, Mail, Phone } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  hourly_rate: z.number().min(0, 'Rate must be a positive number').optional(),
  bio: z.string().optional(),
  experience_years: z.number().min(0, 'Experience must be a positive number').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const HandymanProfile = ({ handyman }: { handyman: any }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>(handyman.specialties || []);
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: handyman.name,
      email: handyman.email,
      phone: handyman.phone || '',
      hourly_rate: handyman.hourly_rate || 0,
      bio: handyman.bio || '',
      experience_years: handyman.experience_years || 0,
    },
    mode: 'onChange',
  });

  const addSpecialty = () => {
    if (specialty.trim() && !specialties.includes(specialty.trim())) {
      const updatedSpecialties = [...specialties, specialty.trim()];
      setSpecialties(updatedSpecialties);
      setSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const updatedSpecialties = specialties.filter((_, i) => i !== index);
    setSpecialties(updatedSpecialties);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    try {
      const updatedHandyman = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        hourly_rate: data.hourly_rate || null,
        bio: data.bio || null,
        experience_years: data.experience_years || null,
        specialties: specialties,
      };
      
      const { error } = await supabase
        .from('handymen')
        .update(updatedHandyman)
        .eq('id', handyman.id);
      
      if (error) throw error;
      
      toast.success('Handyman profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['handymen'] });
    } catch (error: any) {
      console.error('Error updating handyman:', error);
      toast.error(error.message || 'Failed to update handyman profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update the handyman's personal and professional information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>The handyman's standard rate per hour</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Brief description of the handyman's background and expertise</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel>Specialties & Skills</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Plumbing, Electrical, HVAC..."
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addSpecialty} 
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {specialties.map((item, index) => (
                        <Badge key={index} variant="secondary" className="px-2 py-1">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(index)}
                            className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <CardFooter className="px-0 pt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Handyman Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center py-4">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background">
                <img
                  src={handyman.image || "/placeholder.svg"}
                  alt={handyman.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-center">{handyman.name}</h3>
              
              <div className="flex justify-center items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{handyman.rating || 'N/A'}</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{handyman.email}</span>
                </div>
                {handyman.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{handyman.phone}</span>
                  </div>
                )}
                {handyman.experience_years && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{handyman.experience_years} years experience</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Availability Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                    handyman.availability === 'Available'
                      ? 'bg-success/10 text-success'
                      : handyman.availability === 'Busy'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {handyman.availability}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Performance Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time:</span>
                <span className="font-medium">25 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate:</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Resolution Time:</span>
                <span className="font-medium">4.2 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction:</span>
                <span className="font-medium">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HandymanProfile;
