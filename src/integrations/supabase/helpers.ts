import { supabase } from "./client";
import { toast } from "@/components/ui/sonner";

// Helper functions for working with Supabase

export const fetchProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching properties:', error);
    toast.error('Failed to load properties');
    return [];
  }

  return data || [];
};

export const fetchHandymen = async () => {
  const { data, error } = await supabase
    .from('handymen')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching handymen:', error);
    toast.error('Failed to load handymen');
    return [];
  }

  return data || [];
};

export const fetchIssues = async () => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      property:properties(*),
      handyman:handymen(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching issues:', error);
    toast.error('Failed to load issues');
    return [];
  }

  return data || [];
};

export const fetchIssueTimeline = async (issueId: string) => {
  const { data, error } = await supabase
    .from('issue_timeline')
    .select('*')
    .eq('issue_id', issueId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching issue timeline:', error);
    toast.error('Failed to load issue timeline');
    return [];
  }

  return data || [];
};

export const fetchAiCalls = async (issueId?: string) => {
  let query = supabase
    .from('ai_calls')
    .select('*')
    .order('timestamp', { ascending: false });

  if (issueId) {
    query = query.eq('issue_id', issueId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching AI calls:', error);
    toast.error('Failed to load AI calls');
    return [];
  }

  return data || [];
};

// Define interface for dispatch assignments
export interface DispatchAssignment {
  id: string;
  issue_id: string;
  handyman_id: string;
  status: string;
  dispatch_time: string;
  response_time: string | null;
  issue?: {
    id: string;
    title: string;
    priority?: string;
    property_id?: string;
    property?: {
      name: string;
      address: string;
      city: string;
      state: string;
    }
  };
  handyman?: {
    name: string;
    phone: string;
  };
}

export const fetchDispatchAssignments = async (issueId?: string) => {
  // Use any to bypass TypeScript strictness since the table isn't in our types yet
  let query = supabase.from('dispatch_assignments' as any);
  
  let selection = query
    .select(`
      *,
      issue:issues(id, title, property_id, priority, property:properties(name, address, city, state)),
      handyman:handymen(name, phone)
    `)
    .order('dispatch_time', { ascending: false });

  if (issueId) {
    selection = selection.eq('issue_id', issueId);
  }

  const { data, error } = await selection;

  if (error) {
    console.error('Error fetching dispatch assignments:', error);
    toast.error('Failed to load dispatch assignments');
    return [];
  }

  // Use explicit cast to unknown first to satisfy TypeScript
  return (data || []) as unknown as DispatchAssignment[] || [];
};

// Define interface for handyman location coverage
export interface HandymanLocation {
  id: string;
  handyman_id: string;
  coverage_type: 'zip_code' | 'city' | 'radius';
  location_value: string;
  radius_miles?: number;
  priority: number;
  is_primary: boolean;
}

// Define interface for handyman availability
export interface HandymanAvailability {
  id: string;
  handyman_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // Format: "09:00:00"
  end_time: string; // Format: "17:00:00"
  is_available: boolean;
}

// Define interface for time-off requests
export interface HandymanTimeOff {
  id: string;
  handyman_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'requested' | 'approved' | 'denied';
}

export const fetchHandymanLocations = async (handymanId?: string) => {
  // Use supabase client with type assertion to avoid type errors
  const query = supabase.from('handyman_locations' as any);
  
  let selection = query
    .select('*')
    .order('priority', { ascending: true });

  if (handymanId) {
    selection = selection.eq('handyman_id', handymanId);
  }

  const { data, error } = await selection;

  if (error) {
    console.error('Error fetching handyman locations:', error);
    toast.error('Failed to load handyman locations');
    return [];
  }

  // Use explicit cast to unknown first to satisfy TypeScript
  return (data || []) as unknown as HandymanLocation[];
};

export const fetchHandymanAvailability = async (handymanId: string) => {
  // Use supabase client with type assertion to avoid type errors
  const query = supabase.from('handyman_availability' as any);
  
  const { data, error } = await query
    .select('*')
    .eq('handyman_id', handymanId)
    .order('day_of_week', { ascending: true });

  if (error) {
    console.error('Error fetching handyman availability:', error);
    toast.error('Failed to load handyman availability');
    return [];
  }

  // Use explicit cast to unknown first to satisfy TypeScript
  return (data || []) as unknown as HandymanAvailability[];
};

export const fetchHandymanTimeOff = async (handymanId: string) => {
  // Use supabase client with type assertion to avoid type errors
  const query = supabase.from('handyman_time_off' as any);
  
  const { data, error } = await query
    .select('*')
    .eq('handyman_id', handymanId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching handyman time off:', error);
    toast.error('Failed to load handyman time off');
    return [];
  }

  // Use explicit cast to unknown first to satisfy TypeScript
  return (data || []) as unknown as HandymanTimeOff[];
};

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'Resolved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

// New utility functions for integration with Vapi and Twilio

export const initiateVapiCall = async (phoneNumber: string, issueId?: string, guestName?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('vapi-handler', {
      body: {
        phoneNumber,
        issueId,
        guestName,
      },
      method: 'POST',
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return { success: true, callId: data.callId };
  } catch (error) {
    console.error("Error initiating Vapi call:", error);
    toast.error(`Failed to initiate call: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendWhatsAppMessage = async (to: string, message: string, issueId?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-handler', {
      body: {
        purpose: 'send_message',
        to,
        message,
        issueId,
      },
      method: 'POST',
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    toast.error(`Failed to send message: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const dispatchHandyman = async (issueId: string, handymanId: string, customMessage?: string, guestPhone?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-handler', {
      body: {
        purpose: 'dispatch',
        issueId,
        handymanId,
        message: customMessage,
        guestPhone
      },
      method: 'POST',
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error dispatching handyman:", error);
    toast.error(`Failed to dispatch handyman: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Functions for handyman service area management
export const addHandymanLocation = async (locationData: Omit<HandymanLocation, 'id'>) => {
  try {
    const { data, error } = await (supabase.from('handyman_locations' as any))
      .insert(locationData)
      .select('*')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Use explicit cast to unknown first to satisfy TypeScript
    return { success: true, location: data as unknown as HandymanLocation };
  } catch (error) {
    console.error("Error adding handyman location:", error);
    toast.error(`Failed to add location: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const updateHandymanLocation = async (locationId: string, locationData: Partial<HandymanLocation>) => {
  try {
    const { error } = await (supabase.from('handyman_locations' as any))
      .update(locationData)
      .eq('id', locationId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating handyman location:", error);
    toast.error(`Failed to update location: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const deleteHandymanLocation = async (locationId: string) => {
  try {
    const { error } = await (supabase.from('handyman_locations' as any))
      .delete()
      .eq('id', locationId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting handyman location:", error);
    toast.error(`Failed to delete location: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Functions for handyman availability management
export const saveHandymanAvailability = async (handymanId: string, availabilityData: Omit<HandymanAvailability, 'id'>[]) => {
  try {
    // First delete existing availability for the handyman
    const { error: deleteError } = await (supabase.from('handyman_availability' as any))
      .delete()
      .eq('handyman_id', handymanId);
    
    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // Then insert the new availability data
    if (availabilityData.length > 0) {
      const { error: insertError } = await (supabase.from('handyman_availability' as any))
        .insert(availabilityData);
      
      if (insertError) {
        throw new Error(insertError.message);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving handyman availability:", error);
    toast.error(`Failed to save availability: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const requestTimeOff = async (timeOffData: Omit<HandymanTimeOff, 'id'>) => {
  try {
    const { data, error } = await (supabase.from('handyman_time_off' as any))
      .insert(timeOffData)
      .select('*')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Use explicit cast to unknown first to satisfy TypeScript
    return { success: true, timeOff: data as unknown as HandymanTimeOff };
  } catch (error) {
    console.error("Error requesting time off:", error);
    toast.error(`Failed to request time off: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const updateTimeOffStatus = async (timeOffId: string, status: 'approved' | 'denied') => {
  try {
    const { error } = await (supabase.from('handyman_time_off' as any))
      .update({ status })
      .eq('id', timeOffId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating time off status:", error);
    toast.error(`Failed to update time off status: ${error.message}`);
    return { success: false, error: error.message };
  }
};
