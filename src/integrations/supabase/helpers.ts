
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
