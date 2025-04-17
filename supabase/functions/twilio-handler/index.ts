
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process WhatsApp configuration
async function configureWhatsApp(phoneNumber: string) {
  try {
    // Verify the phone number is valid and in E.164 format
    if (!phoneNumber.startsWith('+')) {
      return { 
        success: false, 
        message: "Phone number must be in E.164 format (starting with +)" 
      };
    }
    
    // Store the phone number in system_config
    const { error } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config',
      {
        method: 'UPSERT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: 'whatsapp_number',
          value: phoneNumber,
          description: 'Twilio phone number for WhatsApp messaging'
        }),
      }
    ).then(response => {
      if (!response.ok) return { error: response.statusText };
      return response.json();
    });
    
    if (error) {
      console.error("Error storing WhatsApp number:", error);
      return { 
        success: false, 
        message: `Failed to store WhatsApp number: ${error}` 
      };
    }
    
    return { 
      success: true, 
      message: "WhatsApp configured successfully" 
    };
  } catch (error) {
    console.error("Error in configureWhatsApp:", error);
    return { 
      success: false, 
      message: `Error configuring WhatsApp: ${error.message}` 
    };
  }
}

// Process SMS configuration
async function configureSMS(phoneNumber: string) {
  try {
    // Verify the phone number is valid and in E.164 format
    if (!phoneNumber.startsWith('+')) {
      return { 
        success: false, 
        message: "Phone number must be in E.164 format (starting with +)" 
      };
    }
    
    // Store the phone number in system_config
    const { error } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config',
      {
        method: 'UPSERT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: 'sms_number',
          value: phoneNumber,
          description: 'Twilio phone number for SMS messaging'
        }),
      }
    ).then(response => {
      if (!response.ok) return { error: response.statusText };
      return response.json();
    });
    
    if (error) {
      console.error("Error storing SMS number:", error);
      return { 
        success: false, 
        message: `Failed to store SMS number: ${error}` 
      };
    }
    
    return { 
      success: true, 
      message: "SMS configured successfully" 
    };
  } catch (error) {
    console.error("Error in configureSMS:", error);
    return { 
      success: false, 
      message: `Error configuring SMS: ${error.message}` 
    };
  }
}

// Send a WhatsApp message
async function sendWhatsAppMessage(to: string, message: string, issueId?: string) {
  try {
    // Validate inputs
    if (!to || !message) {
      return { 
        success: false, 
        message: "Recipient phone number and message are required" 
      };
    }
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return { 
        success: false, 
        message: "Twilio credentials are not configured" 
      };
    }
    
    // Get the WhatsApp number from the system_config
    const { data: whatsappConfig, error: configError } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.whatsapp_number',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (configError || !whatsappConfig || whatsappConfig.length === 0) {
      return { 
        success: false, 
        message: "WhatsApp number is not configured" 
      };
    }
    
    const from = `whatsapp:${whatsappConfig[0].value}`;
    const formattedTo = `whatsapp:${to}`;
    
    // Call Twilio API to send the message
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: formattedTo,
          Body: message,
        }).toString(),
      }
    );
    
    const twilioData = await twilioResponse.json();
    
    if (!twilioResponse.ok) {
      console.error("Twilio API error:", twilioData);
      return { 
        success: false, 
        message: `Failed to send WhatsApp message: ${twilioData.message || 'Unknown error'}` 
      };
    }
    
    // If we have an issue ID, add a record to the notifications_log table
    if (issueId) {
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/notifications_log',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            type: 'whatsapp',
            recipient: to,
            content: message,
            status: 'sent',
            external_id: twilioData.sid,
          }),
        }
      );
    }
    
    return { 
      success: true, 
      message: "WhatsApp message sent successfully",
      messageId: twilioData.sid
    };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return { 
      success: false, 
      message: `Error sending WhatsApp message: ${error.message}` 
    };
  }
}

// Send an SMS message
async function sendSMSMessage(to: string, message: string, issueId?: string) {
  try {
    // Validate inputs
    if (!to || !message) {
      return { 
        success: false, 
        message: "Recipient phone number and message are required" 
      };
    }
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return { 
        success: false, 
        message: "Twilio credentials are not configured" 
      };
    }
    
    // Get the SMS number from the system_config
    const { data: smsConfig, error: configError } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.sms_number',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    if (configError || !smsConfig || smsConfig.length === 0) {
      return { 
        success: false, 
        message: "SMS number is not configured" 
      };
    }
    
    const from = smsConfig[0].value;
    
    // Call Twilio API to send the message
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: message,
        }).toString(),
      }
    );
    
    const twilioData = await twilioResponse.json();
    
    if (!twilioResponse.ok) {
      console.error("Twilio API error:", twilioData);
      return { 
        success: false, 
        message: `Failed to send SMS message: ${twilioData.message || 'Unknown error'}` 
      };
    }
    
    // If we have an issue ID, add a record to the notifications_log table
    if (issueId) {
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/notifications_log',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            type: 'sms',
            recipient: to,
            content: message,
            status: 'sent',
            external_id: twilioData.sid,
          }),
        }
      );
    }
    
    return { 
      success: true, 
      message: "SMS message sent successfully",
      messageId: twilioData.sid
    };
  } catch (error) {
    console.error("Error sending SMS message:", error);
    return { 
      success: false, 
      message: `Error sending SMS message: ${error.message}` 
    };
  }
}

// Main request handler
serve(async (req) => {
  // Handle preflight CORS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purpose, phoneNumber, to, message, issueId } = await req.json();
    
    let result;
    
    // Handle different purposes
    switch (purpose) {
      case 'configure':
        result = await configureWhatsApp(phoneNumber);
        break;
      case 'configure_sms':
        result = await configureSMS(phoneNumber);
        break;
      case 'send_message':
        result = await sendWhatsAppMessage(to, message, issueId);
        break;
      case 'send_sms':
        result = await sendSMSMessage(to, message, issueId);
        break;
      default:
        result = { 
          success: false, 
          message: "Invalid purpose specified" 
        };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 400
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: `Error processing request: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
