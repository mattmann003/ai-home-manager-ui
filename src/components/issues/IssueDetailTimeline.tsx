
import { Clock, CheckCircle2 } from 'lucide-react';
import { Issue, formatDateTime } from '@/data/mockData';

type IssueDetailTimelineProps = {
  issue: Issue;
};

const IssueDetailTimeline = ({ issue }: IssueDetailTimelineProps) => {
  if (!issue.timeline || issue.timeline.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium">Status Timeline</h3>
      <div className="relative border-l pl-6 pb-2 space-y-6">
        {issue.timeline.map((event, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[27px] top-1 h-5 w-5 rounded-full border bg-background flex items-center justify-center">
              {index === issue.timeline!.length - 1 && event.status === 'Resolved' ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Clock className="h-3 w-3 text-primary" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${
                  event.status === 'Open' 
                    ? 'text-warning' 
                    : event.status === 'In Progress' 
                    ? 'text-primary' 
                    : 'text-success'
                }`}>
                  {event.status}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(event.timestamp)}
                </div>
              </div>
              {event.note && (
                <p className="text-sm text-muted-foreground">{event.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueDetailTimeline;
