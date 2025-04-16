
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_BASE_URL = 'https://api.twilio.com/2010-04-01';

interface WhatsAppMessageResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

// Process inbound WhatsApp message from Twilio
async function handleInboundMessage(request: any): Promise<WhatsAppMessageResponse> {
  console.log("Handling inbound WhatsApp message from Twilio");
  
  try {
    // Process the webhook data from Twilio
    const { From, Body, MessageSid } = request;
    
    // Log message details
    console.log(`From: ${From}, Message: ${Body}, MessageSid: ${MessageSid}`);
    
    // Check if this is a handyman response to a dispatch
    const isHandymanResponse = await checkIfHandymanResponse(From, Body);
    
    if (isHandymanResponse) {
      return await processHandymanResponse(From, Body, MessageSid);
    } else if (Body && From) {
      // Extract property information if mentioned in the message
      const propertyMention = Body.match(/(?:property|apartment|unit|house)(?:\s+at)?\s+(.+?)(?:,|\.|$)/i);
      const propertyId = propertyMention ? propertyMention[1] : null;
      
      // Extract issue details from the message
      const issueTitle = "Maintenance issue reported via WhatsApp";
      const issueDescription = Body;
      const priority = Body.toLowerCase().includes('urgent') ? "High" : "Medium";
      
      // Create an issue in the database
      const { data: issueData, error: issueError } = await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            title: issueTitle,
            description: issueDescription,
            property_id: propertyId || "00000000-0000-0000-0000-000000000000", // Default property ID or null
            priority: priority,
            status: "Open",
            source: "WhatsApp"
          }),
        }
      ).then(res => res.json());
      
      if (issueError) {
        throw issueError;
      }
      
      // Record message in database
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueData.id,
            message: Body,
            direction: 'inbound',
            channel: 'whatsapp',
            external_id: MessageSid
          }),
        }
      );
      
      // Send confirmation message back to the user
      await sendWhatsAppMessage({
        to: From,
        message: "Thank you for reporting your maintenance issue. We have created a ticket and will address it soon."
      });
      
      return { 
        success: true, 
        message: "Issue created successfully from WhatsApp message", 
        messageId: MessageSid 
      };
    }
    
    return { 
      success: true, 
      message: "Message received but not processed", 
      messageId: MessageSid 
    };
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    return { 
      success: false, 
      message: `Error processing WhatsApp message: ${error.message}` 
    };
  }
}

// Check if the message is a response to a dispatch
async function checkIfHandymanResponse(from: string, body: string): Promise<boolean> {
  try {
    // Check if the phone number belongs to a handyman
    const { data: handymen } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/handymen?phone=eq.${from.replace('whatsapp:', '')}`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (handymen && handymen.length > 0) {
      // Check if there's a pending dispatch for this handyman
      const { data: dispatches } = await fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?handyman_id=eq.${handymen[0].id}&status=eq.pending`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
        }
      ).then(res => res.json());
      
      return dispatches && dispatches.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking if handyman response:", error);
    return false;
  }
}

// Process response from a handyman
async function processHandymanResponse(from: string, body: string, messageSid: string): Promise<WhatsAppMessageResponse> {
  try {
    // Get handyman from phone number
    const { data: handymen } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/handymen?phone=eq.${from.replace('whatsapp:', '')}`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!handymen || handymen.length === 0) {
      return { 
        success: false, 
        message: "No handyman found with this phone number" 
      };
    }
    
    const handyman = handymen[0];
    
    // Get pending dispatch for this handyman
    const { data: dispatches } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?handyman_id=eq.${handyman.id}&status=eq.pending`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!dispatches || dispatches.length === 0) {
      await sendWhatsAppMessage({
        to: from,
        message: "There are no pending assignments for you at the moment."
      });
      
      return { 
        success: false, 
        message: "No pending dispatches found for this handyman" 
      };
    }
    
    const dispatch = dispatches[0];
    const normalizedResponse = body.toLowerCase().trim();
    const accepted = normalizedResponse.includes('accept') || normalizedResponse.includes('yes') || normalizedResponse === '1';
    const declined = normalizedResponse.includes('decline') || normalizedResponse.includes('no') || normalizedResponse === '2';
    
    if (!accepted && !declined) {
      await sendWhatsAppMessage({
        to: from,
        message: "Please respond with 'accept' or 'decline' to the assignment request."
      });
      
      return { 
        success: false, 
        message: "Unclear response from handyman" 
      };
    }
    
    // Update dispatch status
    const newStatus = accepted ? 'accepted' : 'declined';
    await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?id=eq.${dispatch.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: newStatus,
          response_time: new Date().toISOString()
        }),
      }
    );
    
    // Update issue and assign handyman if accepted
    if (accepted) {
      await fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues?id=eq.${dispatch.issue_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            handyman_id: handyman.id,
            status: 'In Progress'
          }),
        }
      );
      
      // Add timeline entry
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: dispatch.issue_id,
            status: 'In Progress',
            note: `Assignment accepted by ${handyman.name} via WhatsApp`
          }),
        }
      );
      
      // Send confirmation to handyman
      await sendWhatsAppMessage({
        to: from,
        message: `Thank you for accepting the assignment. Please visit the property at your earliest convenience. Details about the issue and property are available in your maintenance dashboard.`
      });
      
      // Get issue and property details to notify the guest
      const { data: issueData } = await fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues?id=eq.${dispatch.issue_id}&select=*,property:properties(*)`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
        }
      ).then(res => res.json());
      
      if (issueData && issueData.length > 0 && dispatch.guest_phone) {
        // Notify the guest if we have their phone number
        await sendWhatsAppMessage({
          to: `whatsapp:${dispatch.guest_phone}`,
          message: `Good news! A maintenance professional (${handyman.name}) has been assigned to your issue and will be addressing it soon.`
        });
      }
    } else {
      // Add timeline entry for declined assignment
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: dispatch.issue_id,
            status: 'Open',
            note: `Assignment declined by ${handyman.name} via WhatsApp`
          }),
        }
      );
      
      // Thank handyman for response
      await sendWhatsAppMessage({
        to: from,
        message: "Thank you for your response. We'll assign this task to another maintenance professional."
      });
      
      // Trigger escalation or reassignment process
      await triggerReassignment(dispatch.issue_id);
    }
    
    return { 
      success: true, 
      message: `Handyman ${accepted ? 'accepted' : 'declined'} the assignment`, 
      messageId: messageSid 
    };
  } catch (error) {
    console.error("Error processing handyman response:", error);
    return { 
      success: false, 
      message: `Error processing handyman response: ${error.message}` 
    };
  }
}

// Handle reassignment when a handyman declines
async function triggerReassignment(issueId: string): Promise<void> {
  try {
    // Get issue details
    const { data: issues } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues?id=eq.${issueId}&select=*,property:properties(*)`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!issues || issues.length === 0) return;
    
    const issue = issues[0];
    
    // Find alternative handymen for the property
    const { data: propertyHandymen } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/property_handymen?property_id=eq.${issue.property_id}&select=handyman_id`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!propertyHandymen || propertyHandymen.length === 0) return;
    
    // Get handymen who haven't already declined this issue
    const { data: pastDispatches } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?issue_id=eq.${issueId}&status=eq.declined&select=handyman_id`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    const declinedHandymen = pastDispatches ? pastDispatches.map(d => d.handyman_id) : [];
    
    // Get available handymen for this property who haven't already declined
    const availableHandymen = propertyHandymen
      .filter(ph => !declinedHandymen.includes(ph.handyman_id))
      .map(ph => ph.handyman_id);
    
    if (availableHandymen.length === 0) {
      // No more handymen available, handle escalation
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            status: 'Open',
            note: `Escalation required: All available handymen have declined this assignment`
          }),
        }
      );
      
      return;
    }
    
    // Select a handyman who hasn't declined yet
    const handymanId = availableHandymen[0];
    
    // Get handyman details for dispatch
    const { data: handymen } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/handymen?id=eq.${handymanId}`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!handymen || handymen.length === 0) return;
    
    const handyman = handymen[0];
    
    // Create a new dispatch
    await dispatchToHandyman(issue, handyman);
  } catch (error) {
    console.error("Error triggering reassignment:", error);
  }
}

// Dispatch an issue to a handyman
async function dispatchToHandyman(issue: any, handyman: any): Promise<void> {
  try {
    if (!handyman.phone) return;
    
    // Prepare property address
    const property = issue.property;
    const propertyAddress = property ? 
      `${property.address}, ${property.city}, ${property.state} ${property.zip_code}` : 
      'Address not available';
    
    // Get dispatch template from system_config
    const { data: templates } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.dispatch_template`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    let messageTemplate = templates && templates.length > 0 ? 
      templates[0].value : 
      'New maintenance issue at {property_address}. Issue: {issue_title}. Details: {issue_description}. Reply "1" to accept or "2" to decline.';
    
    // Replace template variables
    const message = messageTemplate
      .replace('{handyman_name}', handyman.name)
      .replace('{property_name}', property ? property.name : 'Unknown Property')
      .replace('{property_address}', propertyAddress)
      .replace('{issue_title}', issue.title)
      .replace('{issue_description}', issue.description)
      .replace('{issue_priority}', issue.priority)
      .replace('{issue_id}', issue.id);
    
    // Create dispatch record
    await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
        body: JSON.stringify({
          issue_id: issue.id,
          handyman_id: handyman.id,
          status: 'pending',
          dispatch_time: new Date().toISOString(),
          message_sent: message,
          guest_phone: null // Add guest phone if available
        }),
      }
    );
    
    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: `whatsapp:${handyman.phone}`,
      message
    });
    
    // Add timeline entry
    await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
        body: JSON.stringify({
          issue_id: issue.id,
          status: 'Open',
          note: `Maintenance request dispatched to ${handyman.name} via WhatsApp`
        }),
      }
    );
  } catch (error) {
    console.error("Error dispatching to handyman:", error);
  }
}

// Send WhatsApp message using Twilio
async function sendWhatsAppMessage(body: any): Promise<WhatsAppMessageResponse> {
  try {
    const { to, message, issueId } = body;
    
    if (!to || !message) {
      return { success: false, message: "To phone number and message are required" };
    }
    
    // Format the destination number for WhatsApp
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    // Get the WhatsApp sender number from the database or configuration
    const configResponse = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.whatsapp_number',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    );
    
    let whatsappFrom;
    if (configResponse.ok) {
      const config = await configResponse.json();
      if (config && config.length > 0) {
        whatsappFrom = `whatsapp:${config[0].value}`;
      } else {
        // Default WhatsApp number if not configured
        whatsappFrom = "whatsapp:+14155238886"; // Twilio default sandbox number
      }
    } else {
      whatsappFrom = "whatsapp:+14155238886"; // Twilio default sandbox number
    }
    
    // Send message via Twilio API
    const formData = new URLSearchParams();
    formData.append('From', whatsappFrom);
    formData.append('To', whatsappTo);
    formData.append('Body', message);
    
    const response = await fetch(`${TWILIO_BASE_URL}/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio API error:", errorText);
      return { success: false, message: `Failed to send message: ${errorText}` };
    }
    
    const responseData = await response.json();
    
    // Record message in database if related to an issue
    if (responseData.sid && issueId) {
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            message: message,
            direction: 'outbound',
            channel: 'whatsapp',
            external_id: responseData.sid
          }),
        }
      );
    }
    
    return { 
      success: true, 
      message: "Message sent successfully", 
      messageId: responseData.sid 
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { 
      success: false, 
      message: `Error sending message: ${error.message}` 
    };
  }
}

// Configure Twilio WhatsApp number
async function configureWhatsAppNumber(body: any): Promise<{ success: boolean; message: string }> {
  try {
    const { phoneNumber } = body;
    
    if (!phoneNumber) {
      return { success: false, message: "Phone number is required" };
    }
    
    // Store the WhatsApp number in the system_config table
    await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          name: 'whatsapp_number',
          value: phoneNumber,
          description: 'Twilio WhatsApp number for maintenance communications'
        }),
      }
    );
    
    return { 
      success: true, 
      message: "WhatsApp number configured successfully" 
    };
  } catch (error) {
    console.error("Error configuring WhatsApp number:", error);
    return { 
      success: false, 
      message: `Error configuring WhatsApp number: ${error.message}` 
    };
  }
}

// Create and send a dispatch to a handyman
async function createDispatch(body: any): Promise<{ success: boolean; message: string }> {
  try {
    const { issueId, handymanId, message, guestPhone } = body;
    
    if (!issueId || !handymanId) {
      return { success: false, message: "Issue ID and Handyman ID are required" };
    }
    
    // Get issue and handyman details
    const [issueResponse, handymanResponse] = await Promise.all([
      fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues?id=eq.${issueId}&select=*,property:properties(*)`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
        }
      ),
      fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/handymen?id=eq.${handymanId}`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
        }
      )
    ]);
    
    const issues = await issueResponse.json();
    const handymen = await handymanResponse.json();
    
    if (!issues || issues.length === 0 || !handymen || handymen.length === 0) {
      return { success: false, message: "Issue or Handyman not found" };
    }
    
    const issue = issues[0];
    const handyman = handymen[0];
    
    // Use custom message or dispatch to handyman with default message
    if (message) {
      // Send custom message
      await sendWhatsAppMessage({
        to: `whatsapp:${handyman.phone}`,
        message,
        issueId
      });
      
      // Create dispatch record
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            handyman_id: handymanId,
            status: 'pending',
            dispatch_time: new Date().toISOString(),
            message_sent: message,
            guest_phone: guestPhone || null
          }),
        }
      );
    } else {
      // Use default dispatch process
      await dispatchToHandyman(issue, handyman);
    }
    
    return { 
      success: true, 
      message: "Dispatch created and sent successfully" 
    };
  } catch (error) {
    console.error("Error creating dispatch:", error);
    return { 
      success: false, 
      message: `Error creating dispatch: ${error.message}` 
    };
  }
}

// Configure dispatch message template
async function configureDispatchTemplate(body: any): Promise<{ success: boolean; message: string }> {
  try {
    const { template } = body;
    
    if (!template) {
      return { success: false, message: "Template is required" };
    }
    
    // Store the template in the system_config table
    await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          name: 'dispatch_template',
          value: template,
          description: 'Template for WhatsApp dispatch messages to handymen'
        }),
      }
    );
    
    return { 
      success: true, 
      message: "Dispatch template configured successfully" 
    };
  } catch (error) {
    console.error("Error configuring dispatch template:", error);
    return { 
      success: false, 
      message: `Error configuring dispatch template: ${error.message}` 
    };
  }
}

// Send a follow-up message to a handyman about a pending dispatch
async function sendFollowUp(body: any): Promise<{ success: boolean; message: string }> {
  try {
    const { dispatchId, message } = body;
    
    if (!dispatchId) {
      return { success: false, message: "Dispatch ID is required" };
    }
    
    // Get dispatch details
    const { data: dispatches } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?id=eq.${dispatchId}&select=*,handyman:handymen(*)`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!dispatches || dispatches.length === 0) {
      return { success: false, message: "Dispatch not found" };
    }
    
    const dispatch = dispatches[0];
    const handyman = dispatch.handyman;
    
    if (!handyman || !handyman.phone) {
      return { success: false, message: "Handyman phone number not found" };
    }
    
    // Default follow-up message
    const followUpMessage = message || 
      "This is a follow-up regarding the maintenance request sent earlier. Please respond with '1' to accept or '2' to decline.";
    
    // Send follow-up message
    const result = await sendWhatsAppMessage({
      to: `whatsapp:${handyman.phone}`,
      message: followUpMessage,
      issueId: dispatch.issue_id
    });
    
    if (!result.success) {
      return { success: false, message: result.message };
    }
    
    // Update dispatch with follow-up timestamp
    await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?id=eq.${dispatchId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          last_followup_time: new Date().toISOString()
        }),
      }
    );
    
    return { 
      success: true, 
      message: "Follow-up message sent successfully" 
    };
  } catch (error) {
    console.error("Error sending follow-up:", error);
    return { 
      success: false, 
      message: `Error sending follow-up: ${error.message}` 
    };
  }
}

// Cancel a pending dispatch
async function cancelDispatch(body: any): Promise<{ success: boolean; message: string }> {
  try {
    const { dispatchId, notifyHandyman, notificationMessage } = body;
    
    if (!dispatchId) {
      return { success: false, message: "Dispatch ID is required" };
    }
    
    // Get dispatch details
    const { data: dispatches } = await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?id=eq.${dispatchId}&select=*,handyman:handymen(*)`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (!dispatches || dispatches.length === 0) {
      return { success: false, message: "Dispatch not found" };
    }
    
    const dispatch = dispatches[0];
    
    // Update dispatch status to canceled
    await fetch(
      `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/dispatch_assignments?id=eq.${dispatchId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        }),
      }
    );
    
    // Notify handyman if requested
    if (notifyHandyman && dispatch.handyman && dispatch.handyman.phone) {
      const message = notificationMessage || 
        "The maintenance request previously sent to you has been canceled. No action is required.";
      
      await sendWhatsAppMessage({
        to: `whatsapp:${dispatch.handyman.phone}`,
        message,
        issueId: dispatch.issue_id
      });
    }
    
    // Add timeline entry
    await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
        body: JSON.stringify({
          issue_id: dispatch.issue_id,
          status: 'Open',
          note: `Dispatch to handyman canceled`
        }),
      }
    );
    
    return { 
      success: true, 
      message: "Dispatch canceled successfully" 
    };
  } catch (error) {
    console.error("Error canceling dispatch:", error);
    return { 
      success: false, 
      message: `Error canceling dispatch: ${error.message}` 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Ensure we have the Twilio credentials
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return new Response(
      JSON.stringify({ success: false, message: "Twilio credentials are not configured" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  try {
    const url = new URL(req.url);
    const body = await req.json();
    
    console.log(`Received request to ${url.pathname}`);
    
    // Route requests based on path or body purpose
    if (url.pathname.includes('/inbound') || body.MessageSid) {
      const result = await handleInboundMessage(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/send-message') || body.purpose === 'send_message') {
      const result = await sendWhatsAppMessage(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/configure') || body.purpose === 'configure') {
      const result = await configureWhatsAppNumber(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/dispatch') || body.purpose === 'dispatch') {
      const result = await createDispatch(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/template') || body.purpose === 'configure_template') {
      const result = await configureDispatchTemplate(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/followup') || body.purpose === 'send_followup') {
      const result = await sendFollowUp(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    } else if (url.pathname.includes('/cancel') || body.purpose === 'cancel_dispatch') {
      const result = await cancelDispatch(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    }
    
    // Default response for unmatched routes
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request endpoint" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, message: `Error processing request: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
