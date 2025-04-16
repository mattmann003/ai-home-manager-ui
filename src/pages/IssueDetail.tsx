
import { useParams, Link } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  UserRound, 
  MessageSquare 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import IssueDetailTimeline from '@/components/issues/IssueDetailTimeline';
import IssueDetailAttachments from '@/components/issues/IssueDetailAttachments';
import IssueCallButton from '@/components/issues/IssueCallButton';
import { issues, properties, handymen, getStatusColorClass, aiCalls, formatDate, formatTime } from '@/data/mockData';

const IssueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const issue = issues.find(issue => issue.id === id);
  
  if (!issue) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Issue Not Found</h1>
            <p className="text-muted-foreground">
              The issue you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/issues">Back to Issues</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const property = properties.find(p => p.id === issue.propertyId);
  const handyman = issue.handymanId ? handymen.find(h => h.id === issue.handymanId) : null;
  const aiCall = issue.aiCallId ? aiCalls.find(call => call.id === issue.aiCallId) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/issues">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{issue.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Issue #{issue.id.split('-')[1]}</span>
              <span>•</span>
              <span>{property ? property.name : 'Unknown Property'}</span>
              <Badge className={getStatusColorClass(issue.status)}>
                {issue.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                <div className="mt-4">
                  <IssueDetailAttachments attachments={issue.attachments} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Status Timeline</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Change Status:</span>
                  <Select defaultValue={issue.status}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <IssueDetailTimeline issue={issue} />
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Resolution Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {issue.resolutionNotes ? (
                  <p className="text-sm text-muted-foreground">{issue.resolutionNotes}</p>
                ) : (
                  <div className="space-y-4">
                    <Textarea 
                      placeholder="Add notes about how this issue was resolved..." 
                      className="min-h-[120px]"
                    />
                    <Button>Save Notes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {aiCall && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">AI Call Playback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Call Transcript</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(aiCall.timestamp)} at {formatTime(aiCall.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {aiCall.transcript}
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="gap-2">
                        <span>Play Recording</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.floor(aiCall.duration / 60)}:{(aiCall.duration % 60).toString().padStart(2, '0')})
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            {issue.guestInfo && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-medium">Guest Information</CardTitle>
                  {issue.guestInfo.phone && (
                    <IssueCallButton 
                      issueId={issue.id} 
                      guestPhone={issue.guestInfo.phone}
                      guestName={issue.guestInfo.name}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt={issue.guestInfo.name} />
                        <AvatarFallback>{issue.guestInfo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{issue.guestInfo.name}</p>
                        <p className="text-xs text-muted-foreground">Guest</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{issue.guestInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{issue.guestInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Check In: {issue.guestInfo.checkIn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Check Out: {issue.guestInfo.checkOut}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Assigned Handyman</CardTitle>
              </CardHeader>
              <CardContent>
                {handyman ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={handyman.image} alt={handyman.name} />
                        <AvatarFallback>{handyman.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{handyman.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {handyman.specialties.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{handyman.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{handyman.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Status: 
                          <span className={`ml-1 ${
                            handyman.availability === 'Available' 
                              ? 'text-success' 
                              : handyman.availability === 'Busy' 
                              ? 'text-warning' 
                              : 'text-muted-foreground'
                          }`}>
                            {handyman.availability}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">Contact Handyman</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-10 w-10 text-muted-foreground p-2 border rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Unassigned</p>
                        <p className="text-xs text-muted-foreground">No handyman assigned yet</p>
                      </div>
                    </div>
                    
                    <div>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign a handyman" />
                        </SelectTrigger>
                        <SelectContent>
                          {handymen.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name} ({h.availability})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full">Assign Handyman</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                {property ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-md overflow-hidden bg-muted">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium">{property.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {property.bedrooms} BD • {property.bathrooms} BA
                      </p>
                    </div>
                    
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/properties/${property.id}`}>
                        View Property Details
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Property details not available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IssueDetail;
