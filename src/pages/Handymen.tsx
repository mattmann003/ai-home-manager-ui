
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HandymanCard from '@/components/handymen/HandymanCard';
import AddHandymanDialog from '@/components/handymen/AddHandymanDialog';
import ImportHandymenDialog from '@/components/handymen/ImportHandymenDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search, Upload, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { fetchHandymen } from '@/integrations/supabase/helpers';

const Handymen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  const { data: handymen = [], refetch, isLoading } = useQuery({
    queryKey: ['handymen'],
    queryFn: fetchHandymen,
  });

  const filteredHandymen = handymen.filter(handyman => {
    // Filter by search query
    const matchesSearch = 
      (handyman.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (handyman.specialties && handyman.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
      
    // Filter by availability
    const matchesAvailability = 
      availabilityFilter === 'all' || handyman.availability === availabilityFilter;
      
    return matchesSearch && matchesAvailability;
  });

  const handleImportComplete = () => {
    refetch();
    setImportDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Handymen</h1>
            <p className="text-muted-foreground">Manage your maintenance staff.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex items-center gap-1"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Add Handyman</span>
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredHandymen.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHandymen.map(handyman => (
              <HandymanCard key={handyman.id} handyman={handyman} />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No handymen found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Your First Handyman
            </Button>
          </div>
        )}
      </div>
      
      <AddHandymanDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
      />
      
      <ImportHandymenDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
};

export default Handymen;
