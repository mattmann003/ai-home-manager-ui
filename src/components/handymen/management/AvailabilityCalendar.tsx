
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchHandymanAvailability, fetchHandymanTimeOff, HandymanAvailability, HandymanTimeOff } from '@/integrations/supabase/helpers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { CalendarRange, Clock, Save, X } from 'lucide-react';
import { format, addDays, isWithinInterval, parseISO } from 'date-fns';

const AvailabilityCalendar = ({ handymanId }: { handymanId: string }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [addingTimeOff, setAddingTimeOff] = useState(false);
  const [timeOffRange, setTimeOffRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [timeOffReason, setTimeOffReason] = useState('');
  
  const [workingHours, setWorkingHours] = useState<{
    [key: number]: { start: string; end: string; isWorking: boolean };
  }>({
    0: { start: '09:00', end: '17:00', isWorking: false }, // Sunday
    1: { start: '09:00', end: '17:00', isWorking: true },  // Monday
    2: { start: '09:00', end: '17:00', isWorking: true },  // Tuesday
    3: { start: '09:00', end: '17:00', isWorking: true },  // Wednesday
    4: { start: '09:00', end: '17:00', isWorking: true },  // Thursday
    5: { start: '09:00', end: '17:00', isWorking: true },  // Friday
    6: { start: '09:00', end: '17:00', isWorking: false }, // Saturday
  });
  
  const queryClient = useQueryClient();
  
  const { data: availability = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['handyman-availability', handymanId],
    queryFn: () => fetchHandymanAvailability(handymanId)
  });
  
  // Handle data after it's fetched - use useEffect instead of useState
  useEffect(() => {
    if (availability.length > 0) {
      const newWorkingHours = { ...workingHours };
      availability.forEach((a: HandymanAvailability) => {
        newWorkingHours[a.day_of_week] = {
          start: a.start_time.substring(0, 5), // Format: HH:MM
          end: a.end_time.substring(0, 5),     // Format: HH:MM
          isWorking: a.is_available,
        };
      });
      setWorkingHours(newWorkingHours);
    }
  }, [availability]); // Depend on availability data
  
  const { data: timeOff = [], isLoading: isLoadingTimeOff } = useQuery({
    queryKey: ['handyman-time-off', handymanId],
    queryFn: () => fetchHandymanTimeOff(handymanId)
  });
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const handleWorkingDayToggle = (day: number) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isWorking: !prev[day].isWorking
      }
    }));
  };
  
  const handleTimeChange = (day: number, type: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };
  
  const saveWorkingHours = async () => {
    try {
      // First delete existing records
      await (supabase
        .from('handyman_availability') as any)
        .delete()
        .eq('handyman_id', handymanId);
      
      // Then insert new records
      const records = Object.entries(workingHours).map(([day, hours]) => ({
        handyman_id: handymanId,
        day_of_week: parseInt(day),
        start_time: hours.start + ':00', // Add seconds for PostgreSQL time format
        end_time: hours.end + ':00',
        is_available: hours.isWorking
      }));
      
      const { error } = await (supabase
        .from('handyman_availability') as any)
        .insert(records);
      
      if (error) throw error;
      
      toast.success('Work schedule saved successfully');
      queryClient.invalidateQueries({ queryKey: ['handyman-availability', handymanId] });
      setEditingSchedule(false);
    } catch (error: any) {
      console.error('Error saving work schedule:', error);
      toast.error(error.message || 'Failed to save work schedule');
    }
  };
  
  const requestTimeOff = async () => {
    if (!timeOffRange.from || !timeOffRange.to || !timeOffReason) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const { error } = await (supabase
        .from('handyman_time_off') as any)
        .insert({
          handyman_id: handymanId,
          start_date: timeOffRange.from.toISOString(),
          end_date: timeOffRange.to.toISOString(),
          reason: timeOffReason,
          status: 'approved' // Auto-approve for this demo
        });
      
      if (error) throw error;
      
      toast.success('Time off request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['handyman-time-off', handymanId] });
      
      // Reset form
      setTimeOffRange({
        from: new Date(),
        to: addDays(new Date(), 1),
      });
      setTimeOffReason('');
      setAddingTimeOff(false);
    } catch (error: any) {
      console.error('Error requesting time off:', error);
      toast.error(error.message || 'Failed to request time off');
    }
  };
  
  const deleteTimeOff = async (id: string) => {
    try {
      const { error } = await (supabase
        .from('handyman_time_off') as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Time off request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['handyman-time-off', handymanId] });
    } catch (error: any) {
      console.error('Error deleting time off request:', error);
      toast.error(error.message || 'Failed to delete time off request');
    }
  };
  
  const isDateTimeOff = (date: Date) => {
    return timeOff.some((t: HandymanTimeOff) => 
      isWithinInterval(date, {
        start: parseISO(t.start_date),
        end: parseISO(t.end_date)
      })
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Availability Calendar</CardTitle>
            <CardDescription>
              View scheduled time off and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                timeOff: (date) => isDateTimeOff(date),
              }}
              modifiersClassNames={{
                timeOff: "bg-orange-100 text-orange-800",
              }}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selected Date:</span>
                <span className="font-medium">{date ? format(date, 'EEEE, MMM d, yyyy') : 'None'}</span>
              </div>
              
              {date && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {isDateTimeOff(date) ? (
                    <span className="text-orange-600 font-medium">Time Off</span>
                  ) : workingHours[date.getDay()].isWorking ? (
                    <span className="text-green-600 font-medium">Working</span>
                  ) : (
                    <span className="text-gray-600 font-medium">Day Off</span>
                  )}
                </div>
              )}
              
              {date && workingHours[date.getDay()].isWorking && !isDateTimeOff(date) && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hours:</span>
                  <span className="font-medium">
                    {workingHours[date.getDay()].start} - {workingHours[date.getDay()].end}
                  </span>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setAddingTimeOff(true)}
              disabled={addingTimeOff}
            >
              <CalendarRange className="h-4 w-4 mr-2" />
              Request Time Off
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Configure regular working hours
                </CardDescription>
              </div>
              <Button 
                variant={editingSchedule ? "secondary" : "outline"}
                size="sm"
                onClick={() => setEditingSchedule(!editingSchedule)}
              >
                {editingSchedule ? 'Cancel' : 'Edit Schedule'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingAvailability ? (
                <div className="space-y-2">
                  <div className="h-12 bg-muted rounded-md animate-pulse"></div>
                  <div className="h-12 bg-muted rounded-md animate-pulse"></div>
                  <div className="h-12 bg-muted rounded-md animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {daysOfWeek.map((day, index) => (
                    <div 
                      key={day} 
                      className={`p-3 rounded-md ${
                        workingHours[index].isWorking 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              workingHours[index].isWorking ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></div>
                          <span className="font-medium">{day}</span>
                        </div>
                        
                        {editingSchedule ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleWorkingDayToggle(index)}
                              className={`px-2 py-1 text-xs rounded ${
                                workingHours[index].isWorking 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {workingHours[index].isWorking ? 'Working' : 'Day Off'}
                            </button>
                          </div>
                        ) : (
                          <span className={`text-sm ${
                            workingHours[index].isWorking 
                              ? 'text-green-700' 
                              : 'text-gray-500'
                          }`}>
                            {workingHours[index].isWorking 
                              ? `${workingHours[index].start} - ${workingHours[index].end}` 
                              : 'Not Working'
                            }
                          </span>
                        )}
                      </div>
                      
                      {editingSchedule && workingHours[index].isWorking && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">From</span>
                          </div>
                          <input 
                            type="time" 
                            value={workingHours[index].start}
                            onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                          />
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">To</span>
                          </div>
                          <input 
                            type="time" 
                            value={workingHours[index].end}
                            onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                            className="px-2 py-1 text-xs border rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {editingSchedule && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingSchedule(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveWorkingHours}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Schedule
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Off Requests</CardTitle>
            <CardDescription>
              Manage vacation, sick days, and other time off
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addingTimeOff ? (
              <div className="space-y-4 p-4 bg-muted/50 rounded-md">
                <h3 className="font-medium">New Time Off Request</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarRange className="h-4 w-4 mr-2" />
                          {timeOffRange.from ? format(timeOffRange.from, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={timeOffRange.from}
                          onSelect={(date) => date && setTimeOffRange({ ...timeOffRange, from: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarRange className="h-4 w-4 mr-2" />
                          {timeOffRange.to ? format(timeOffRange.to, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={timeOffRange.to}
                          onSelect={(date) => date && setTimeOffRange({ ...timeOffRange, to: date })}
                          initialFocus
                          disabled={(date) => date < timeOffRange.from}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason</label>
                  <textarea
                    value={timeOffReason}
                    onChange={(e) => setTimeOffReason(e.target.value)}
                    placeholder="Vacation, sick leave, etc."
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddingTimeOff(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={requestTimeOff}
                    disabled={!timeOffRange.from || !timeOffRange.to || !timeOffReason}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            ) : isLoadingTimeOff ? (
              <div className="space-y-2">
                <div className="h-20 bg-muted rounded-md animate-pulse"></div>
                <div className="h-20 bg-muted rounded-md animate-pulse"></div>
              </div>
            ) : timeOff.length > 0 ? (
              <div className="space-y-3">
                {timeOff.map((item: HandymanTimeOff) => (
                  <div
                    key={item.id}
                    className="p-3 bg-orange-50 border border-orange-200 rounded-md"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(parseISO(item.start_date), 'MMM d, yyyy')} - {format(parseISO(item.end_date), 'MMM d, yyyy')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : item.status === 'denied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.reason}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTimeOff(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarRange className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No time off requests.</p>
                <p className="text-sm text-muted-foreground">
                  Add requests for vacation, sick days, or other time off.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
