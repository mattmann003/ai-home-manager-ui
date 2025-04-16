
import { Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const VapiCallInfo = () => {
  // Replace with your actual Vapi phone number
  const phoneNumber = "+1 (555) 123-4567";
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Maintenance Hotline</CardTitle>
        <CardDescription>
          Guests can call this number to report maintenance issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-medium">{phoneNumber}</span>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
            Active
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Our AI assistant will answer calls 24/7 and automatically create maintenance tickets.
        </p>
      </CardContent>
    </Card>
  );
};

export default VapiCallInfo;
