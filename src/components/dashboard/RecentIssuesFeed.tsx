
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Home, ArrowRight, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Issue = {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  handyman_id: string | null;
  property_id: string;
  property?: {
    name: string;
  };
  handyman?: {
    name: string;
  };
};

const RecentIssuesFeed = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadRecentIssues = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          property:properties(name),
          handyman:handymen(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error loading recent issues:', error);
      toast.error('Failed to load recent issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentIssues();

    // Set up real-time subscription
    const channel = supabase
      .channel('recent-issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        () => {
          loadRecentIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const getStatusColor = (status: string, priority: string) => {
    if (priority === 'Urgent') return 'bg-red-100 text-red-800 hover:bg-red-200';
    
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Issues</CardTitle>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-pulse flex flex-col space-y-4 w-full">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
              ))}
            </div>
          </div>
        ) : issues.length > 0 ? (
          <AnimatePresence>
            {issues.map((issue) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border-b pb-3 last:border-none"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="flex-1">
                    <Link to={`/issues/${issue.id}`} className="font-medium text-primary hover:underline">
                      {issue.title}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Home className="h-3.5 w-3.5" />
                      <span>{issue.property?.name || 'Unknown Property'}</span>
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatTimeAgo(issue.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Badge className={getStatusColor(issue.status, issue.priority)}>
                      {issue.priority === 'Urgent' ? 'Urgent' : issue.status}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span>{issue.handyman?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No issues found.
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/issues" className="flex items-center gap-1">
            View All Issues
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentIssuesFeed;
