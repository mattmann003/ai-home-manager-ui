
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tables } from '@/integrations/supabase/types';

type HandymanCardProps = {
  handyman: Tables<'handymen'>;
};

const HandymanCard = ({ handyman }: HandymanCardProps) => {
  const getAvailabilityClass = (availability: string | null) => {
    switch (availability) {
      case 'Available':
        return 'bg-success/10 text-success';
      case 'Busy':
        return 'bg-warning/10 text-warning';
      case 'Off Duty':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${handyman.name}`} alt={handyman.name} />
            <AvatarFallback>{handyman.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{handyman.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{handyman.email}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${getAvailabilityClass(handyman.availability)}`}>
            {handyman.availability}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {handyman.specialties && handyman.specialties.length > 0 ? (
                handyman.specialties.map((specialty, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">None specified</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          to={`/handymen/${handyman.id}`}
          className="w-full text-center text-sm py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
};

export default HandymanCard;
