
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiCalls, formatDateTime } from '@/data/mockData';

const AiCallLog = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">AI Call Log</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[400px]">
          <div className="divide-y">
            {aiCalls.map((call) => (
              <div key={call.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatDateTime(call.timestamp)}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(call.duration / 60)}m {call.duration % 60}s
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{call.transcript}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Issue #{call.issueId.split('-')[1]}
                  </div>
                  <div className="text-xs text-muted-foreground">{call.resolution}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiCallLog;
