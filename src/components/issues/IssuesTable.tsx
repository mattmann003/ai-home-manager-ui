import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProperties, fetchIssues, getStatusColorClass, formatDateTime } from '@/integrations/supabase/helpers';
import { toast } from '@/components/ui/sonner';

const IssuesTable = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [issuesData, propertiesData] = await Promise.all([
          fetchIssues(),
          fetchProperties()
        ]);
        
        setIssues(issuesData);
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time subscription for issues
    const channel = supabase
      .channel('issues-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        async (payload) => {
          // Refresh the issues data when changes occur
          const refreshedIssues = await fetchIssues();
          setIssues(refreshedIssues);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredIssues = issues.filter(issue => {
    // Filter by status if a status filter is selected
    if (statusFilter && issue.status !== statusFilter) {
      return false;
    }
    
    // Filter by property if a property filter is selected
    if (propertyFilter && issue.property_id !== propertyFilter) {
      return false;
    }
    
    return true;
  });

  // Paginate issues
  const indexOfLastIssue = currentPage * itemsPerPage;
  const indexOfFirstIssue = indexOfLastIssue - itemsPerPage;
  const currentIssues = filteredIssues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : 'Unknown Property';
  };

  const getHandymanName = (handymanId: string | null) => {
    if (!handymanId) return 'Unassigned';
    
    // Fix: Changed from "issue.handyman?.name" to using currentIssues array
    // We need to find the current issue's handyman name from the related data
    const currentIssue = currentIssues.find(issue => issue.handyman_id === handymanId);
    return currentIssue?.handyman?.name || 'Unknown Handyman';
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? null : value);
    setCurrentPage(1);
  };

  const handlePropertyFilterChange = (value: string) => {
    setPropertyFilter(value === 'all' ? null : value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading issues...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(filteredIssues.length, indexOfFirstIssue + 1)}-{Math.min(indexOfLastIssue, filteredIssues.length)} of {filteredIssues.length} issues
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Status:</span>
            <Select
              value={statusFilter || 'all'}
              onValueChange={handleStatusFilterChange}
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
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Property:</span>
            <Select
              value={propertyFilter || 'all'}
              onValueChange={handlePropertyFilterChange}
            >
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentIssues.length > 0 ? (
              currentIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">#{issue.id.substring(0, 8)}</TableCell>
                  <TableCell>
                    <Link 
                      to={`/issues/${issue.id}`} 
                      className="font-medium text-primary hover:underline"
                    >
                      {issue.title}
                    </Link>
                  </TableCell>
                  <TableCell>{issue.property?.name || getPropertyName(issue.property_id)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColorClass(issue.status)}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{issue.source}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(issue.created_at)}</TableCell>
                  <TableCell>{getHandymanName(issue.handyman_id)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default IssuesTable;
