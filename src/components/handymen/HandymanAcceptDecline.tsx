
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type RequestItem = {
  id: string;
  propertyName: string;
  issueTitle: string;
  urgency: 'Low' | 'Medium' | 'High';
  requestedAt: string;
  expiresIn: string;
};

const mockRequests: RequestItem[] = [
  {
    id: '1',
    propertyName: 'Oceanview Villa',
    issueTitle: 'Broken AC Unit',
    urgency: 'High',
    requestedAt: '10:30 AM Today',
    expiresIn: '45 minutes'
  },
  {
    id: '2',
    propertyName: 'Downtown Loft',
    issueTitle: 'Leaking Faucet',
    urgency: 'Medium',
    requestedAt: 'Yesterday',
    expiresIn: '2 hours'
  }
];

const mockHistory = [
  {
    id: '3',
    propertyName: 'Mountain Cabin',
    issueTitle: 'No Hot Water',
    urgency: 'High',
    requestedAt: '2 days ago',
    status: 'Accepted'
  },
  {
    id: '4',
    propertyName: 'Wine Country Cottage',
    issueTitle: 'Broken Window Latch',
    urgency: 'Low',
    requestedAt: '3 days ago',
    status: 'Declined'
  }
];

const HandymanAcceptDecline = () => {
  const [pendingRequests, setPendingRequests] = useState(mockRequests);
  const [history, setHistory] = useState(mockHistory);

  const handleAccept = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      setHistory([
        ...history,
        { ...request, status: 'Accepted' as const }
      ]);
    }
  };

  const handleDecline = (requestId: string) => {
    const request = pendingRequests.find(r => r.id === requestId);
    if (request) {
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      setHistory([
        ...history,
        { ...request, status: 'Declined' as const }
      ]);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Maintenance Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <div key={request.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{request.issueTitle}</h3>
                    <Badge 
                      className={`
                        ${request.urgency === 'High' ? 'bg-destructive/10 text-destructive' : 
                          request.urgency === 'Medium' ? 'bg-warning/10 text-warning' : 
                          'bg-muted text-muted-foreground'}
                      `}
                    >
                      {request.urgency} Priority
                    </Badge>
                  </div>
                  
                  <p className="text-sm">{request.propertyName}</p>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Requested: {request.requestedAt}</span>
                    </div>
                    <div>Expires in: {request.expiresIn}</div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleAccept(request.id)}
                      className="w-full gap-1 bg-success hover:bg-success/90"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Accept</span>
                    </Button>
                    <Button 
                      onClick={() => handleDecline(request.id)}
                      variant="outline" 
                      className="w-full gap-1 text-destructive border-destructive hover:bg-destructive/10"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>Decline</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="border rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.issueTitle}</h3>
                  <Badge 
                    className={`
                      ${item.status === 'Accepted' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
                    `}
                  >
                    {item.status}
                  </Badge>
                </div>
                
                <p className="text-sm">{item.propertyName}</p>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Requested: {item.requestedAt}</span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HandymanAcceptDecline;
