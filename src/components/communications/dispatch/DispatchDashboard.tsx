
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, UserX, CheckCircle, ClockIcon, ArrowRight } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface HandymanMetrics {
  handymanId: string;
  handymanName: string;
  averageResponseTime: number;
  acceptanceRate: number;
  pendingCount: number;
}

interface DispatchData {
  id: string;
  issue_id: string;
  issue_title?: string;
  handyman_id: string;
  handyman_name?: string;
  property_name?: string;
  property_address?: string;
  status: string;
  dispatch_time: string;
  response_time: string | null;
  priority?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  accepted: "bg-green-100 text-green-800 hover:bg-green-200",
  declined: "bg-red-100 text-red-800 hover:bg-red-200",
  canceled: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  escalated: "bg-purple-100 text-purple-800 hover:bg-purple-200"
};

const priorityIcons = {
  High: <AlertCircle className="h-4 w-4 text-red-500" />,
  Medium: <ClockIcon className="h-4 w-4 text-yellow-500" />,
  Low: <CheckCircle className="h-4 w-4 text-green-500" />
};

const DispatchDashboard = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');

  // Query dispatches data
  const { 
    data: dispatches, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['dispatch-dashboard', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('dispatch_assignments')
        .select(`
          *,
          issue:issues(id, title, description, priority),
          handyman:handymen(id, name, phone),
          property:issues(property:properties(name, address, city, state, zip_code))
        `);
      
      // Filter based on active tab
      if (activeTab === 'pending') {
        query = query.eq('status', 'pending');
      } else if (activeTab === 'accepted') {
        query = query.eq('status', 'accepted');
      } else if (activeTab === 'declined') {
        query = query.eq('status', 'declined');
      }
      
      query = query.order('dispatch_time', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data for easier display
      return data.map(d => ({
        id: d.id,
        issue_id: d.issue_id,
        issue_title: d.issue?.title,
        handyman_id: d.handyman_id,
        handyman_name: d.handyman?.name,
        property_name: d.property?.[0]?.property?.name,
        property_address: d.property?.[0]?.property ? 
          `${d.property[0].property.address}, ${d.property[0].property.city}, ${d.property[0].property.state}` :
          'Unknown location',
        status: d.status,
        dispatch_time: d.dispatch_time,
        response_time: d.response_time,
        priority: d.issue?.priority
      }));
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Query handyman metrics
  const { data: handymanMetrics } = useQuery({
    queryKey: ['handyman-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispatch_assignments')
        .select(`
          handyman_id,
          handyman:handymen(name),
          status,
          dispatch_time,
          response_time
        `);
      
      if (error) throw error;
      
      // Calculate metrics for each handyman
      const handymenMap = new Map<string, {
        handymanId: string;
        handymanName: string;
        totalDispatches: number;
        accepted: number;
        declined: number;
        pending: number;
        totalResponseTime: number;
        responseCounts: number;
      }>();
      
      data.forEach(dispatch => {
        const handymanId = dispatch.handyman_id;
        const handymanName = dispatch.handyman?.name || 'Unknown';
        
        if (!handymenMap.has(handymanId)) {
          handymenMap.set(handymanId, {
            handymanId,
            handymanName,
            totalDispatches: 0,
            accepted: 0,
            declined: 0,
            pending: 0,
            totalResponseTime: 0,
            responseCounts: 0
          });
        }
        
        const handyman = handymenMap.get(handymanId)!;
        handyman.totalDispatches++;
        
        if (dispatch.status === 'accepted') handyman.accepted++;
        if (dispatch.status === 'declined') handyman.declined++;
        if (dispatch.status === 'pending') handyman.pending++;
        
        // Calculate response time if available
        if (dispatch.response_time && dispatch.dispatch_time) {
          const dispatchTime = new Date(dispatch.dispatch_time).getTime();
          const responseTime = new Date(dispatch.response_time).getTime();
          const diffMinutes = (responseTime - dispatchTime) / (1000 * 60);
          
          handyman.totalResponseTime += diffMinutes;
          handyman.responseCounts++;
        }
      });
      
      // Transform the map to an array of metrics
      return Array.from(handymenMap.values()).map(h => ({
        handymanId: h.handymanId,
        handymanName: h.handymanName,
        averageResponseTime: h.responseCounts > 0 ? 
          Math.round(h.totalResponseTime / h.responseCounts) : 
          0,
        acceptanceRate: h.totalDispatches > 0 ? 
          Math.round((h.accepted / (h.accepted + h.declined)) * 100) : 
          0,
        pendingCount: h.pending
      }));
    }
  });

  // Listen for realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('dispatch-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_assignments'
        },
        (payload) => {
          console.log('Dispatch change:', payload);
          refetch();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleResendFollowup = async (dispatchId: string) => {
    try {
      const { error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'send_followup',
          dispatchId: dispatchId
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('Follow-up message sent successfully');
      refetch();
    } catch (error) {
      console.error('Error sending follow-up:', error);
      toast.error('Failed to send follow-up message');
    }
  };

  const handleCancelDispatch = async (dispatchId: string) => {
    try {
      const { error } = await supabase.functions.invoke('twilio-handler', {
        body: {
          purpose: 'cancel_dispatch',
          dispatchId: dispatchId,
          notifyHandyman: true
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('Dispatch canceled successfully');
      refetch();
    } catch (error) {
      console.error('Error canceling dispatch:', error);
      toast.error('Failed to cancel dispatch');
    }
  };

  const filteredDispatches = !dispatches ? [] : (
    filterStatus === 'all' 
      ? dispatches 
      : dispatches.filter(d => d.status === filterStatus)
  );

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Dispatches</h3>
            <p className="text-muted-foreground mt-2">
              There was a problem loading the dispatch data.
            </p>
            <Button className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center">
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pending" className="m-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Dispatches</CardTitle>
              <CardDescription>
                Maintenance requests awaiting handyman response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredDispatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClockIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>No pending dispatches found</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredDispatches.map((dispatch) => (
                      <motion.div
                        key={dispatch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                {priorityIcons[dispatch.priority as keyof typeof priorityIcons] || 
                                  priorityIcons.Medium}
                                <h3 className="font-medium">{dispatch.issue_title || 'Maintenance Request'}</h3>
                                <Badge className={statusColors[dispatch.status as keyof typeof statusColors]}>
                                  {dispatch.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dispatch.property_name}: {dispatch.property_address}
                              </p>
                              <p className="text-sm mt-1">
                                Assigned to: <span className="font-medium">{dispatch.handyman_name}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sent {formatDistanceToNow(new Date(dispatch.dispatch_time))} ago
                              </p>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleResendFollowup(dispatch.id)}
                              >
                                Send Reminder
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleCancelDispatch(dispatch.id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accepted" className="m-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Accepted Assignments</CardTitle>
              <CardDescription>
                Maintenance requests accepted by handymen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredDispatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>No accepted assignments found</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredDispatches.map((dispatch) => (
                      <motion.div
                        key={dispatch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                {priorityIcons[dispatch.priority as keyof typeof priorityIcons] || 
                                  priorityIcons.Medium}
                                <h3 className="font-medium">{dispatch.issue_title || 'Maintenance Request'}</h3>
                                <Badge className={statusColors[dispatch.status as keyof typeof statusColors]}>
                                  {dispatch.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dispatch.property_name}: {dispatch.property_address}
                              </p>
                              <p className="text-sm mt-1">
                                Accepted by: <span className="font-medium">{dispatch.handyman_name}</span>
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>Sent {formatDistanceToNow(new Date(dispatch.dispatch_time))} ago</span>
                                {dispatch.response_time && (
                                  <>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>Accepted {formatDistanceToNow(new Date(dispatch.response_time))} ago</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                asChild
                              >
                                <a href={`/issues/${dispatch.issue_id}`}>View Issue</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="declined" className="m-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Declined Assignments</CardTitle>
              <CardDescription>
                Maintenance requests declined by handymen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredDispatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>No declined assignments found</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredDispatches.map((dispatch) => (
                      <motion.div
                        key={dispatch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                {priorityIcons[dispatch.priority as keyof typeof priorityIcons] || 
                                  priorityIcons.Medium}
                                <h3 className="font-medium">{dispatch.issue_title || 'Maintenance Request'}</h3>
                                <Badge className={statusColors[dispatch.status as keyof typeof statusColors]}>
                                  {dispatch.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {dispatch.property_name}: {dispatch.property_address}
                              </p>
                              <p className="text-sm mt-1">
                                Declined by: <span className="font-medium">{dispatch.handyman_name}</span>
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>Sent {formatDistanceToNow(new Date(dispatch.dispatch_time))} ago</span>
                                {dispatch.response_time && (
                                  <>
                                    <ArrowRight className="h-3 w-3" />
                                    <span>Declined {formatDistanceToNow(new Date(dispatch.response_time))} ago</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                asChild
                              >
                                <a href={`/issues/${dispatch.issue_id}`}>Reassign</a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Handyman Response Metrics</CardTitle>
          <CardDescription>Response times and acceptance rates for handymen</CardDescription>
        </CardHeader>
        <CardContent>
          {!handymanMetrics || handymanMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClockIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p>No metrics available yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3 text-left text-sm font-medium">Handyman</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Avg. Response Time</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Acceptance Rate</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {handymanMetrics.map((metric) => (
                    <tr key={metric.handymanId} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 text-sm">{metric.handymanName}</td>
                      <td className="py-2 px-3 text-sm">
                        {metric.averageResponseTime === 0 ? 
                          "No data" : 
                          `${metric.averageResponseTime} min`}
                      </td>
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{metric.acceptanceRate}%</span>
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${metric.acceptanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm">
                        {metric.pendingCount > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50">
                            {metric.pendingCount} pending
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatchDashboard;
