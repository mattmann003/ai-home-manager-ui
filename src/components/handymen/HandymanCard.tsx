
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Handyman, properties } from '@/data/mockData';
import { Star, Clock, Briefcase } from 'lucide-react';

type HandymanCardProps = {
  handyman: Handyman;
};

const HandymanCard = ({ handyman }: HandymanCardProps) => {
  const assignedPropertyCount = handyman.assignedProperties.length;
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="pt-6 flex justify-center">
        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background">
          <img
            src={handyman.image}
            alt={handyman.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <CardContent className="p-4 text-center">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">{handyman.name}</h3>
          
          <div className="text-sm text-muted-foreground">
            {handyman.specialties.join(' • ')}
          </div>
          
          <div className="flex items-center justify-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{handyman.rating}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <Clock className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="font-medium">{handyman.responseTime} min</span>
              <span className="text-xs text-muted-foreground">Resp. Time</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <Briefcase className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="font-medium">{assignedPropertyCount}</span>
              <span className="text-xs text-muted-foreground">Properties</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                handyman.availability === 'Available'
                  ? 'bg-success/10 text-success'
                  : handyman.availability === 'Busy'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {handyman.availability}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          to={`/handymen/${handyman.id}`}
          className="w-full text-center text-sm py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Profile
        </Link>
      </CardFooter>
    </Card>
  );
};

export default HandymanCard;
