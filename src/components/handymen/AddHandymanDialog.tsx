
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const handymanSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  availability: z.string().default('Available'),
  specialties: z.array(z.string()).optional(),
});

type HandymanFormValues = z.infer<typeof handymanSchema>;

export default function AddHandymanDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const defaultValues: Partial<HandymanFormValues> = {
    name: '',
    email: '',
    phone: '',
    availability: 'Available',
    specialties: [],
  };

  const form = useForm<HandymanFormValues>({
    resolver: zodResolver(handymanSchema),
    defaultValues,
    mode: 'onChange',
  });

  const addSpecialty = () => {
    if (specialty.trim() && !specialties.includes(specialty.trim())) {
      const updatedSpecialties = [...specialties, specialty.trim()];
      setSpecialties(updatedSpecialties);
      form.setValue('specialties', updatedSpecialties);
      setSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    const updatedSpecialties = specialties.filter((_, i) => i !== index);
    setSpecialties(updatedSpecialties);
    form.setValue('specialties', updatedSpecialties);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  async function onSubmit(data: HandymanFormValues) {
    setIsSubmitting(true);
    try {
      // Ensure all required fields are present
      const handyman = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        availability: data.availability,
        specialties: specialties,
      };
      
      const { error } = await supabase.from('handymen').insert(handyman);
      
      if (error) throw error;
      
      toast.success('Handyman added successfully');
      queryClient.invalidateQueries({ queryKey: ['handymen'] });
      setOpen(false);
      form.reset(defaultValues);
      setSpecialties([]);
    } catch (error: any) {
      console.error('Error adding handyman:', error);
      toast.error(error.message || 'Failed to add handyman');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Handyman</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Handyman</DialogTitle>
          <DialogDescription>
            Enter the details of the handyman you want to add to your maintenance team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@example.com" {...field} />
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
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Specialties</FormLabel>
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
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Handyman'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
