
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

interface PromptTemplatesFormProps {
  initialValues?: {
    identityVerification: string;
    issueTriage: string;
    escalation: string;
  };
}

const PromptTemplatesForm = ({ initialValues }: PromptTemplatesFormProps) => {
  const [identityVerification, setIdentityVerification] = useState(
    initialValues?.identityVerification || 
    "To verify your identity, I'll need to ask some questions about your property. Could you please tell me your full name and the address of your property?"
  );
  
  const [issueTriage, setIssueTriage] = useState(
    initialValues?.issueTriage || 
    "To help you with your issue, I'll need to gather some information. Could you please describe the problem you're experiencing in detail? When did it start? Is it affecting the entire property or just a specific area?"
  );
  
  const [escalation, setEscalation] = useState(
    initialValues?.escalation || 
    "I understand this is a complex issue that requires expert attention. I'll need to transfer you to one of our maintenance specialists who can better assist you. Please hold while I connect you."
  );

  const handleSavePrompts = async () => {
    try {
      // Save prompts to system_config table
      const promptUpdates = [
        { name: 'vapi_identity_verification_prompt', value: identityVerification },
        { name: 'vapi_issue_triage_prompt', value: issueTriage },
        { name: 'vapi_escalation_prompt', value: escalation },
      ];

      // Batch update prompts
      for (const prompt of promptUpdates) {
        const { error } = await supabase
          .from('system_config')
          .upsert({ 
            name: prompt.name, 
            value: prompt.value 
          })
          .select();

        if (error) {
          throw error;
        }
      }
      
      toast.success("Prompts saved successfully");
    } catch (error) {
      console.error("Error saving prompts:", error);
      toast.error("Failed to save prompts");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h3 className="text-sm font-medium mb-2">Identity Verification Prompt</h3>
        <Textarea 
          className="min-h-24"
          placeholder="To verify your identity, I'll need to ask some questions..."
          value={identityVerification}
          onChange={(e) => setIdentityVerification(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border p-4">
        <h3 className="text-sm font-medium mb-2">Issue Triage Prompt</h3>
        <Textarea 
          className="min-h-24"
          placeholder="To help you with your issue, I'll need to gather some information..."
          value={issueTriage}
          onChange={(e) => setIssueTriage(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border p-4">
        <h3 className="text-sm font-medium mb-2">Escalation Prompt</h3>
        <Textarea 
          className="min-h-24"
          placeholder="I'll need to transfer you to a human agent..."
          value={escalation}
          onChange={(e) => setEscalation(e.target.value)}
        />
      </div>
      
      <Button className="gap-2 mt-2" onClick={handleSavePrompts}>
        <Save className="h-4 w-4" />
        Save Prompts
      </Button>
    </div>
  );
};

export default PromptTemplatesForm;
