
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import IssuesTable from '@/components/issues/IssuesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProperties } from '@/integrations/supabase/helpers';
import { toast } from '@/components/ui/sonner';

const Issues = () => {
  const [isNewIssueDialogOpen, setIsNewIssueDialogOpen] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    property_id: '',
    priority: 'Medium',
    status: 'Open',
    source: 'Manual'
  });

  useEffect(() => {
    const loadProperties = async () => {
      const propertiesData = await fetchProperties();
      setProperties(propertiesData);
    };

    loadProperties();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIssue.title || !newIssue.description || !newIssue.property_id) {
      toast.error('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert new issue
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .insert(newIssue)
        .select()
        .single();

      if (issueError) throw issueError;

      // Add first timeline entry
      await supabase
        .from('issue_timeline')
        .insert({
          issue_id: issueData.id,
          status: 'Open',
          note: 'Issue created',
          created_by: 'System'
        });

      toast.success('Issue created successfully');
      setIsNewIssueDialogOpen(false);
      
      // Reset form
      setNewIssue({
        title: '',
        description: '',
        property_id: '',
        priority: 'Medium',
        status: 'Open',
        source: 'Manual'
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
            <p className="text-muted-foreground">Manage and track all maintenance issues.</p>
          </div>
          <Button 
            className="flex items-center gap-1"
            onClick={() => setIsNewIssueDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Issue</span>
          </Button>
        </div>
        
        <IssuesTable />

        <Dialog open={isNewIssueDialogOpen} onOpenChange={setIsNewIssueDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Issue</DialogTitle>
              <DialogDescription>
                Enter the details for the new maintenance issue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    className="col-span-3"
                    value={newIssue.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="property" className="text-right">
                    Property
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newIssue.property_id}
                      onValueChange={(value) => handleSelectChange('property_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={newIssue.priority}
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3"
                    rows={5}
                    value={newIssue.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewIssueDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Issue'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Issues;
