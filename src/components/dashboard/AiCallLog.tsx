
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/integrations/supabase/helpers';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Check, AlertTriangle, Clock } from 'lucide-react';

type AiCallLogProps = {
  aiCalls: any[];
};

const AiCallLog = ({ aiCalls }: AiCallLogProps) => {
  const getCallStatusIcon = (resolution: string | undefined) => {
    if (!resolution) return <Clock className="h-4 w-4" />;
    if (resolution.toLowerCase().includes('resolved') || resolution.toLowerCase().includes('completed')) {
      return <Check className="h-4 w-4 text-success" />;
    }
    if (resolution.toLowerCase().includes('failed') || resolution.toLowerCase().includes('error')) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    return <FileText className="h-4 w-4 text-primary" />;
  };

  const getCallStatusClass = (resolution: string | undefined) => {
    if (!resolution) return 'bg-muted text-muted-foreground';
    if (resolution.toLowerCase().includes('resolved') || resolution.toLowerCase().includes('completed')) {
      return 'bg-green-100 text-green-800';
    }
    if (resolution.toLowerCase().includes('failed') || resolution.toLowerCase().includes('error')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">AI Call Log</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[400px]">
          <div className="divide-y">
            {aiCalls.length > 0 ? (
              aiCalls.map((call) => (
                <div key={call.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCallStatusIcon(call.resolution)}
                      <span className="text-sm font-medium">{formatDateTime(call.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(call.duration / 60)}m {call.duration % 60}s
                      </Badge>
                      {call.issue_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          asChild
                        >
                          <Link to={`/issues/${call.issue_id}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span className="text-xs">View Issue</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                    {call.transcript}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {call.issue_id && (
                      <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Issue #{call.issue_id.substring(0, 8)}
                      </div>
                    )}
                    {call.resolution && (
                      <div className={`text-xs px-2 py-1 rounded-full ${getCallStatusClass(call.resolution)}`}>
                        {call.resolution}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No AI calls recorded yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiCallLog;
