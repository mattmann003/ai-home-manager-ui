
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  Settings, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import HandymanAssignedProperties from '@/components/handymen/HandymanAssignedProperties';
import HandymanAcceptDecline from '@/components/handymen/HandymanAcceptDecline';
import { handymen } from '@/data/mockData';

const HandymanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const handyman = handymen.find(handyman => handyman.id === id);

  if (!handyman) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Handyman Not Found</h1>
            <p className="text-muted-foreground">
              The handyman you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/handymen">Back to Handymen</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/handymen">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{handyman.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{handyman.specialties.join(' • ')}</span>
              <Badge 
                className={`
                  ${handyman.availability === 'Available' 
                    ? 'bg-success/10 text-success' 
                    : handyman.availability === 'Busy' 
                    ? 'bg-warning/10 text-warning' 
                    : 'bg-muted text-muted-foreground'}
                `}
              >
                {handyman.availability}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-success/10 p-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{handyman.responseTime}m</div>
                  <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="rounded-full bg-destructive/10 p-3 mb-3">
                    <X className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-2xl font-bold">6%</div>
                  <p className="text-sm text-muted-foreground">Decline Rate</p>
                </CardContent>
              </Card>
            </div>
            
            <HandymanAssignedProperties handyman={handyman} />
            
            <HandymanAcceptDecline />
          </div>
          
          <div className="space-y-6">
            <Card className="shadow-sm overflow-hidden">
              <div className="bg-primary h-24"></div>
              <CardContent className="pt-0 relative p-6">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={handyman.image} alt={handyman.name} />
                    <AvatarFallback>{handyman.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mt-14 space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{handyman.name}</h2>
                    <div className="flex items-center justify-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{handyman.rating}</span>
                      <span className="text-xs text-muted-foreground">(24 reviews)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{handyman.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{handyman.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Button className="w-full">Contact</Button>
                    <Button variant="outline" className="w-full gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {handyman.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HandymanDetail;
