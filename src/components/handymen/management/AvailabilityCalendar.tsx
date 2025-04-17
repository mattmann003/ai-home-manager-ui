
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarRange, Plus, Save, Trash, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, parse, isWithinInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { fetchHandymanAvailability, fetchHandymanTimeOff, HandymanAvailability, HandymanTimeOff, saveHandymanAvailability, requestTimeOff, updateTimeOffStatus } from '@/integrations/supabase/helpers';
import { useQuery } from '@tanstack/react-query';

interface AvailabilityCalendarProps {
  handymanId: string;
}

const DaysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const AvailabilityCalendar = ({ handymanId }: AvailabilityCalendarProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('weekly');
  const [workingHours, setWorkingHours] = useState<HandymanAvailability[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [timeOffDate, setTimeOffDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeOffReason, setTimeOffReason] = useState('');

  // Fetch handyman's availability schedule
  const { data: availability, isLoading: isLoadingAvailability, refetch: refetchAvailability } = useQuery({
    queryKey: ['handyman-availability', handymanId],
    queryFn: () => fetchHandymanAvailability(handymanId),
    meta: {
      onSuccess: (data) => {
        if (data && data.length > 0) {
          setWorkingHours(data);
        } else {
          // Initialize with default working hours (9AM-5PM, Mon-Fri)
          const defaultHours: Omit<HandymanAvailability, 'id'>[] = Array(7).fill(null).map((_, idx) => ({
            handyman_id: handymanId,
            day_of_week: idx,
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_available: idx !== 0 && idx !== 6 // Not available on weekends by default
          }));
          setWorkingHours(defaultHours as HandymanAvailability[]);
        }
      }
    }
  });

  // Fetch handyman's time-off requests
  const { data: timeOff, isLoading: isLoadingTimeOff, refetch: refetchTimeOff } = useQuery({
    queryKey: ['handyman-time-off', handymanId],
    queryFn: () => fetchHandymanTimeOff(handymanId)
  });

  // Initialize workingHours when availability data loads
  useEffect(() => {
    if (availability && availability.length > 0) {
      setWorkingHours(availability);
    }
  }, [availability]);

  const handleSaveAvailability = async () => {
    // Map workingHours to the format expected by the API
    const availabilityData = workingHours.map(({ id, ...rest }) => rest);
    
    try {
      const result = await saveHandymanAvailability(handymanId, availabilityData);
      
      if (result.success) {
        toast({
          title: "Availability saved",
          description: "The handyman's availability has been updated.",
        });
        setIsEditing(false);
        refetchAvailability();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save availability",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRequestTimeOff = async () => {
    if (!timeOffDate || !endDate || !timeOffReason) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const timeOffRequest = {
      handyman_id: handymanId,
      start_date: format(timeOffDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      reason: timeOffReason,
      status: 'requested' as const
    };

    try {
      const result = await requestTimeOff(timeOffRequest);
      
      if (result.success) {
        toast({
          title: "Time off requested",
          description: "Your time off request has been submitted.",
        });
        
        // Reset form
        setTimeOffDate(new Date());
        setEndDate(addDays(new Date(), 1));
        setTimeOffReason('');
        
        // Refresh time off data
        refetchTimeOff();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to request time off",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting time off:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTimeOff = async (timeOffId: string, status: 'approved' | 'denied') => {
    try {
      const result = await updateTimeOffStatus(timeOffId, status);
      
      if (result.success) {
        toast({
          title: `Time off ${status}`,
          description: `The time off request has been ${status}.`,
        });
        
        // Refresh time off data
        refetchTimeOff();
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${status} time off`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating time off:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTimeChange = (day: number, field: 'start_time' | 'end_time', value: string) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.day_of_week === day 
          ? { ...hour, [field]: value + ':00' } 
          : hour
      )
    );
  };

  const handleAvailabilityToggle = (day: number, isAvailable: boolean) => {
    setWorkingHours(prev => 
      prev.map(hour => 
        hour.day_of_week === day 
          ? { ...hour, is_available: isAvailable } 
          : hour
      )
    );
  };

  const getTimeOffStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const isTimeOffDay = (date: Date) => {
    if (!timeOff) return false;
    
    return timeOff.some(off => {
      const startDate = new Date(off.start_date);
      const endDate = new Date(off.end_date);
      return isWithinInterval(date, { start: startDate, end: endDate }) && off.status === 'approved';
    });
  };

  if (isLoadingAvailability || isLoadingTimeOff) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">Loading availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Availability Management</CardTitle>
            <CardDescription>Manage working hours and time off</CardDescription>
          </div>
          {selectedTab === 'weekly' && (
            isEditing ? (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveAvailability}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Hours
              </Button>
            )
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="weekly">
              Weekly Schedule
            </TabsTrigger>
            <TabsTrigger value="timeoff">
              Time Off
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <div className="space-y-4">
              {workingHours.map((day) => (
                <div key={day.day_of_week} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Label className="font-medium">{DaysOfWeek[day.day_of_week]}</Label>
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Checkbox 
                      id={`available-${day.day_of_week}`}
                      checked={day.is_available}
                      onCheckedChange={(checked) => handleAvailabilityToggle(day.day_of_week, checked === true)}
                      disabled={!isEditing}
                    />
                    <Label 
                      htmlFor={`available-${day.day_of_week}`}
                      className="ml-2 text-sm font-normal"
                    >
                      Available
                    </Label>
                  </div>
                  
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={day.start_time.split(':').slice(0, 2).join(':')}
                      onChange={(e) => handleTimeChange(day.day_of_week, 'start_time', e.target.value)}
                      disabled={!isEditing || !day.is_available}
                    />
                  </div>
                  
                  <div className="col-span-1 text-center">to</div>
                  
                  <div className="col-span-3">
                    <Input
                      type="time"
                      value={day.end_time.split(':').slice(0, 2).join(':')}
                      onChange={(e) => handleTimeChange(day.day_of_week, 'end_time', e.target.value)}
                      disabled={!isEditing || !day.is_available}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timeoff">
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-4">Request Time Off</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarRange className="mr-2 h-4 w-4" />
                          {timeOffDate ? format(timeOffDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={timeOffDate}
                          onSelect={setTimeOffDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarRange className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => (timeOffDate ? date < timeOffDate : false)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      value={timeOffReason}
                      onChange={(e) => setTimeOffReason(e.target.value)}
                      placeholder="Vacation, personal day, etc."
                    />
                  </div>
                </div>
                
                <Button 
                  className="mt-4"
                  onClick={handleRequestTimeOff}
                  disabled={!timeOffDate || !endDate || !timeOffReason}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-4">Time Off Requests</h3>
                
                {timeOff && timeOff.length > 0 ? (
                  <div className="space-y-4">
                    {timeOff.map((request) => (
                      <div key={request.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                          </div>
                          <div>
                            {getTimeOffStatus(request.status)}
                          </div>
                        </div>
                        
                        {request.status === 'requested' && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleUpdateTimeOff(request.id, 'denied')}
                            >
                              Deny
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleUpdateTimeOff(request.id, 'approved')}
                            >
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">No time off requests found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
