
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
    
    if (Body && From) {
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
