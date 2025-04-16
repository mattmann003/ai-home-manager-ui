
export type Issue = {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  updatedAt: string;
  propertyId: string;
  handymanId: string | null;
  source: 'Guest' | 'AI Assistant' | 'Owner';
  attachments?: string[];
  timeline?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  guestInfo?: {
    name: string;
    phone: string;
    email: string;
    checkIn: string;
    checkOut: string;
  };
  aiCallId?: string;
  resolutionNotes?: string;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  image: string;
  assignedHandymen: string[];
  maintenanceHistory?: {
    issueId: string;
    title: string;
    date: string;
    status: string;
  }[];
};

export type Handyman = {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
  specialties: string[];
  assignedProperties: string[];
  rating: number;
  responseTime: number; // in minutes
  availability: 'Available' | 'Busy' | 'Off Duty';
};

export type AICall = {
  id: string;
  timestamp: string;
  duration: number; // in seconds
  transcript: string;
  issueId: string;
  resolution: string;
};

export type AnalyticsData = {
  issuesPerProperty: {
    propertyName: string;
    issues: number;
  }[];
  responseTimeByHandyman: {
    handymanName: string;
    responseTime: number; // in minutes
  }[];
  resolutionTimeByIssueType: {
    issueType: string;
    resolutionTime: number; // in hours
  }[];
  commonIssueTypes: {
    issueType: string;
    count: number;
  }[];
  monthlyIssues: {
    month: string;
    issues: number;
  }[];
};

// Mock Issues Data
export const issues: Issue[] = [
  {
    id: "issue-1",
    title: "Broken AC Unit",
    description: "The air conditioning is not cooling properly. Guest says it's blowing warm air.",
    status: "Open",
    createdAt: "2023-04-12T10:30:00Z",
    updatedAt: "2023-04-12T10:30:00Z",
    propertyId: "property-1",
    handymanId: null,
    source: "Guest",
    attachments: ["broken-ac.jpg"],
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-12T10:30:00Z",
        note: "Issue reported by guest"
      }
    ],
    guestInfo: {
      name: "John Smith",
      phone: "555-123-4567",
      email: "john.smith@example.com",
      checkIn: "2023-04-10",
      checkOut: "2023-04-17"
    },
    aiCallId: "call-1"
  },
  {
    id: "issue-2",
    title: "Leaking Faucet",
    description: "Kitchen sink faucet is dripping constantly.",
    status: "In Progress",
    createdAt: "2023-04-11T08:15:00Z",
    updatedAt: "2023-04-12T12:45:00Z",
    propertyId: "property-2",
    handymanId: "handyman-2",
    source: "AI Assistant",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-11T08:15:00Z",
        note: "Issue detected by AI Assistant"
      },
      {
        status: "In Progress",
        timestamp: "2023-04-12T12:45:00Z",
        note: "Assigned to David Johnson"
      }
    ]
  },
  {
    id: "issue-3",
    title: "No Hot Water",
    description: "Guests are reporting that there is no hot water in the bathrooms or kitchen.",
    status: "Resolved",
    createdAt: "2023-04-10T14:20:00Z",
    updatedAt: "2023-04-11T16:30:00Z",
    propertyId: "property-3",
    handymanId: "handyman-1",
    source: "Guest",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-10T14:20:00Z",
        note: "Issue reported by guest"
      },
      {
        status: "In Progress",
        timestamp: "2023-04-10T15:45:00Z",
        note: "Assigned to Mike Brown"
      },
      {
        status: "Resolved",
        timestamp: "2023-04-11T16:30:00Z",
        note: "Water heater reset and functioning properly now"
      }
    ],
    resolutionNotes: "Water heater had tripped its circuit breaker. Reset breaker and tested water temperature. All systems functioning normally now."
  },
  {
    id: "issue-4",
    title: "Wifi Not Working",
    description: "Guests cannot connect to the wireless internet network.",
    status: "Open",
    createdAt: "2023-04-12T11:45:00Z",
    updatedAt: "2023-04-12T11:45:00Z",
    propertyId: "property-1",
    handymanId: null,
    source: "Guest",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-12T11:45:00Z",
        note: "Issue reported by guest"
      }
    ],
    guestInfo: {
      name: "Sarah Johnson",
      phone: "555-987-6543",
      email: "sarah.j@example.com",
      checkIn: "2023-04-11",
      checkOut: "2023-04-14"
    }
  },
  {
    id: "issue-5",
    title: "Clogged Toilet",
    description: "Toilet in master bathroom is clogged and won't flush properly.",
    status: "In Progress",
    createdAt: "2023-04-11T09:30:00Z",
    updatedAt: "2023-04-12T10:15:00Z",
    propertyId: "property-4",
    handymanId: "handyman-3",
    source: "Guest",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-11T09:30:00Z",
        note: "Issue reported by guest"
      },
      {
        status: "In Progress",
        timestamp: "2023-04-12T10:15:00Z",
        note: "Assigned to Lisa Chen"
      }
    ]
  },
  {
    id: "issue-6",
    title: "Broken Window Latch",
    description: "Window in living room won't close properly due to broken latch.",
    status: "Resolved",
    createdAt: "2023-04-09T16:20:00Z",
    updatedAt: "2023-04-10T13:10:00Z",
    propertyId: "property-5",
    handymanId: "handyman-1",
    source: "Owner",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-09T16:20:00Z",
        note: "Issue reported by property owner during inspection"
      },
      {
        status: "In Progress",
        timestamp: "2023-04-10T09:30:00Z",
        note: "Assigned to Mike Brown"
      },
      {
        status: "Resolved",
        timestamp: "2023-04-10T13:10:00Z",
        note: "Window latch replaced with new hardware"
      }
    ],
    resolutionNotes: "Replaced broken window latch with new hardware. Window now closes and locks securely."
  },
  {
    id: "issue-7",
    title: "Smoke Detector Beeping",
    description: "Smoke detector in hallway is beeping every 30 seconds.",
    status: "Resolved",
    createdAt: "2023-04-11T20:15:00Z",
    updatedAt: "2023-04-12T09:45:00Z",
    propertyId: "property-2",
    handymanId: "handyman-2",
    source: "Guest",
    timeline: [
      {
        status: "Open",
        timestamp: "2023-04-11T20:15:00Z",
        note: "Issue reported by guest"
      },
      {
        status: "In Progress",
        timestamp: "2023-04-12T08:30:00Z",
        note: "Assigned to David Johnson"
      },
      {
        status: "Resolved",
        timestamp: "2023-04-12T09:45:00Z",
        note: "Battery replaced in smoke detector"
      }
    ],
    resolutionNotes: "Replaced low battery in smoke detector. Tested unit to confirm proper function."
  }
];

// Mock Properties Data
export const properties: Property[] = [
  {
    id: "property-1",
    name: "Oceanview Villa",
    address: "123 Beach Road",
    city: "Malibu",
    state: "CA",
    zipCode: "90265",
    bedrooms: 4,
    bathrooms: 3,
    image: "/placeholder.svg",
    assignedHandymen: ["handyman-1", "handyman-2"],
    maintenanceHistory: [
      {
        issueId: "issue-1",
        title: "Broken AC Unit",
        date: "2023-04-12",
        status: "Open"
      },
      {
        issueId: "issue-4",
        title: "Wifi Not Working",
        date: "2023-04-12",
        status: "Open"
      }
    ]
  },
  {
    id: "property-2",
    name: "Downtown Loft",
    address: "456 Main Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90012",
    bedrooms: 2,
    bathrooms: 2,
    image: "/placeholder.svg",
    assignedHandymen: ["handyman-2", "handyman-3"],
    maintenanceHistory: [
      {
        issueId: "issue-2",
        title: "Leaking Faucet",
        date: "2023-04-11",
        status: "In Progress"
      },
      {
        issueId: "issue-7",
        title: "Smoke Detector Beeping",
        date: "2023-04-11",
        status: "Resolved"
      }
    ]
  },
  {
    id: "property-3",
    name: "Mountain Cabin",
    address: "789 Forest Lane",
    city: "Big Bear",
    state: "CA",
    zipCode: "92315",
    bedrooms: 3,
    bathrooms: 2,
    image: "/placeholder.svg",
    assignedHandymen: ["handyman-1", "handyman-3"],
    maintenanceHistory: [
      {
        issueId: "issue-3",
        title: "No Hot Water",
        date: "2023-04-10",
        status: "Resolved"
      }
    ]
  },
  {
    id: "property-4",
    name: "Desert Oasis",
    address: "101 Palm Drive",
    city: "Palm Springs",
    state: "CA",
    zipCode: "92262",
    bedrooms: 4,
    bathrooms: 3.5,
    image: "/placeholder.svg",
    assignedHandymen: ["handyman-3"],
    maintenanceHistory: [
      {
        issueId: "issue-5",
        title: "Clogged Toilet",
        date: "2023-04-11",
        status: "In Progress"
      }
    ]
  },
  {
    id: "property-5",
    name: "Wine Country Cottage",
    address: "202 Vineyard Road",
    city: "Napa",
    state: "CA",
    zipCode: "94558",
    bedrooms: 2,
    bathrooms: 1,
    image: "/placeholder.svg",
    assignedHandymen: ["handyman-1", "handyman-2"],
    maintenanceHistory: [
      {
        issueId: "issue-6",
        title: "Broken Window Latch",
        date: "2023-04-09",
        status: "Resolved"
      }
    ]
  }
];

// Mock Handymen Data
export const handymen: Handyman[] = [
  {
    id: "handyman-1",
    name: "Mike Brown",
    phone: "555-111-2222",
    email: "mike.brown@example.com",
    image: "/placeholder.svg",
    specialties: ["Plumbing", "General Repairs", "HVAC"],
    assignedProperties: ["property-1", "property-3", "property-5"],
    rating: 4.8,
    responseTime: 42, // in minutes
    availability: "Available"
  },
  {
    id: "handyman-2",
    name: "David Johnson",
    phone: "555-333-4444",
    email: "david.johnson@example.com",
    image: "/placeholder.svg",
    specialties: ["Electrical", "Appliance Repair"],
    assignedProperties: ["property-1", "property-2", "property-5"],
    rating: 4.6,
    responseTime: 38, // in minutes
    availability: "Busy"
  },
  {
    id: "handyman-3",
    name: "Lisa Chen",
    phone: "555-555-6666",
    email: "lisa.chen@example.com",
    image: "/placeholder.svg",
    specialties: ["Plumbing", "Carpentry", "Painting"],
    assignedProperties: ["property-2", "property-3", "property-4"],
    rating: 4.9,
    responseTime: 31, // in minutes
    availability: "Available"
  }
];

// Mock AI Calls Data
export const aiCalls: AICall[] = [
  {
    id: "call-1",
    timestamp: "2023-04-12T10:25:00Z",
    duration: 137, // in seconds
    transcript: "Guest: Hi, the AC in our unit isn't working right. It's blowing but the air isn't cold.\nAI: I understand. When did you first notice the issue?\nGuest: Last night when we checked in, but we thought it might improve.\nAI: I'll create a maintenance request for this right away. A property manager will contact you soon.",
    issueId: "issue-1",
    resolution: "Created maintenance ticket for broken AC unit"
  },
  {
    id: "call-2",
    timestamp: "2023-04-11T08:12:00Z",
    duration: 95, // in seconds
    transcript: "AI: Regular property check. I've detected a leak under the kitchen sink.\nProperty Manager: How severe is the leak?\nAI: It appears to be a slow drip from the faucet connection. No standing water yet.\nProperty Manager: Thanks for catching this. I'll send someone to fix it.",
    issueId: "issue-2",
    resolution: "Detected faucet leak during automated system check"
  },
  {
    id: "call-3",
    timestamp: "2023-04-10T14:18:00Z",
    duration: 182, // in seconds
    transcript: "Guest: We don't have any hot water in the shower or sinks.\nAI: I'm sorry to hear that. Have you checked if the water gets warm after running it for a while?\nGuest: We've let it run for several minutes but it's still cold.\nAI: Thank you for this information. I'll create an urgent maintenance request for the water heater.",
    issueId: "issue-3",
    resolution: "Created urgent maintenance ticket for hot water issue"
  }
];

// Mock Analytics Data
export const analyticsData: AnalyticsData = {
  issuesPerProperty: [
    { propertyName: "Oceanview Villa", issues: 2 },
    { propertyName: "Downtown Loft", issues: 2 },
    { propertyName: "Mountain Cabin", issues: 1 },
    { propertyName: "Desert Oasis", issues: 1 },
    { propertyName: "Wine Country Cottage", issues: 1 }
  ],
  responseTimeByHandyman: [
    { handymanName: "Lisa Chen", responseTime: 31 },
    { handymanName: "David Johnson", responseTime: 38 },
    { handymanName: "Mike Brown", responseTime: 42 }
  ],
  resolutionTimeByIssueType: [
    { issueType: "Plumbing", resolutionTime: 26.5 },
    { issueType: "Electrical", resolutionTime: 13.5 },
    { issueType: "HVAC", resolutionTime: 48.2 },
    { issueType: "General Maintenance", resolutionTime: 20.8 }
  ],
  commonIssueTypes: [
    { issueType: "Plumbing", count: 3 },
    { issueType: "HVAC", count: 1 },
    { issueType: "Electrical", count: 1 },
    { issueType: "WiFi/Internet", count: 1 },
    { issueType: "General Maintenance", count: 1 }
  ],
  monthlyIssues: [
    { month: "Jan", issues: 3 },
    { month: "Feb", issues: 5 },
    { month: "Mar", issues: 4 },
    { month: "Apr", issues: 7 },
    { month: "May", issues: 2 },
    { month: "Jun", issues: 4 },
    { month: "Jul", issues: 6 },
    { month: "Aug", issues: 8 },
    { month: "Sep", issues: 5 },
    { month: "Oct", issues: 3 },
    { month: "Nov", issues: 2 },
    { month: "Dec", issues: 4 }
  ]
};

// Utility function to get status color class
export const getStatusColorClass = (status: string): string => {
  switch (status) {
    case 'Open':
      return 'text-warning bg-warning/10';
    case 'In Progress':
      return 'text-primary bg-primary/10';
    case 'Resolved':
      return 'text-success bg-success/10';
    default:
      return 'text-gray-500 bg-gray-100';
  }
};

// Utility function to format date
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Utility function to format time
export const formatTime = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

// Utility function to format date and time
export const formatDateTime = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleString(undefined, options);
};
