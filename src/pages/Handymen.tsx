
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HandymanCard from '@/components/handymen/HandymanCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handymen } from '@/data/mockData';

const Handymen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  const filteredHandymen = handymen.filter(handyman => {
    // Filter by search query
    const matchesSearch = 
      handyman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      handyman.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Filter by availability
    const matchesAvailability = 
      availabilityFilter === 'all' || handyman.availability === availabilityFilter;
      
    return matchesSearch && matchesAvailability;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Handymen</h1>
            <p className="text-muted-foreground">Manage your maintenance staff.</p>
          </div>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Handyman</span>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search handymen..."
              className="w-full rounded-md pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Availability:</span>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Off Duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHandymen.length > 0 ? (
            filteredHandymen.map(handyman => (
              <HandymanCard key={handyman.id} handyman={handyman} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No handymen found.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Handymen;
