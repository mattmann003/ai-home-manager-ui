
import { Paperclip } from 'lucide-react';

type IssueDetailAttachmentsProps = {
  attachments?: string[];
};

const IssueDetailAttachments = ({ attachments }: IssueDetailAttachmentsProps) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Paperclip className="h-4 w-4" />
        <span>Attachments ({attachments.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => (
          <div 
            key={index}
            className="relative group w-24 h-24 rounded-md overflow-hidden border bg-muted"
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/placeholder.svg"
                alt={`Attachment ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="text-xs text-white bg-primary/80 px-2 py-1 rounded">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueDetailAttachments;
