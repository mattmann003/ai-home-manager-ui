
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY');
const VAPI_ASSISTANT_ID = Deno.env.get('VAPI_ASSISTANT_ID');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VapiCallRequest {
  phoneNumber: string;
  issueId?: string;
  guestName?: string;
}

interface VapiCallResponse {
  success: boolean;
  message: string;
  callId?: string;
}

// Initiate a call using the Vapi API
async function initiateCall(body: VapiCallRequest): Promise<VapiCallResponse> {
  try {
    // Debug logging to check if keys are properly configured
    console.log("Vapi API Key configured:", !!VAPI_API_KEY);
    console.log("Vapi Assistant ID configured:", !!VAPI_ASSISTANT_ID);
    
    if (!VAPI_API_KEY) {
      return { success: false, message: "Vapi API key is not configured" };
    }
    
    if (!VAPI_ASSISTANT_ID) {
      return { success: false, message: "Vapi Assistant ID is not configured" };
    }
    
    const { phoneNumber, issueId, guestName } = body;
    
    if (!phoneNumber) {
      return { success: false, message: "Phone number is required" };
    }
    
    // Get the welcome message from system_config
    const { data: welcomeMessageConfig } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.vapi_welcome_message',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    const welcomeMessage = welcomeMessageConfig && welcomeMessageConfig.length > 0 
      ? welcomeMessageConfig[0].value 
      : "Hello, this is the property management AI assistant. How can I help you today?";
    
    // Get the voice setting from system_config
    const { data: voiceConfig } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.vapi_voice',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    const voice = voiceConfig && voiceConfig.length > 0 ? voiceConfig[0].value : "nova";
    
    // Get max call duration from system_config
    const { data: durationConfig } = await fetch(
      'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/system_config?name=eq.vapi_max_call_duration',
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
        },
      }
    ).then(res => res.json());
    
    const maxDurationMinutes = durationConfig && durationConfig.length > 0 
      ? parseInt(durationConfig[0].value) 
      : 15;
    
    // Create the call options
    const callOptions = {
      assistant_id: VAPI_ASSISTANT_ID,
      to: phoneNumber,
      voice: {
        voice_id: voice
      },
      first_message: welcomeMessage,
      max_duration: maxDurationMinutes * 60,
      webhook_url: "https://sjxeupeggseedybibyzx.supabase.co/functions/v1/vapi-handler/webhooks",
      metadata: {}
    };
    
    // Add issue ID to metadata if provided
    if (issueId) {
      callOptions.metadata.issue_id = issueId;
    }
    
    // Add guest name to metadata if provided
    if (guestName) {
      callOptions.metadata.guest_name = guestName;
    }
    
    console.log("Making Vapi API call with options:", JSON.stringify(callOptions));
    
    // Call the Vapi API to initiate a call
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(callOptions)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vapi API error:", errorText);
      return { success: false, message: `Failed to initiate call: ${errorText}` };
    }
    
    const data = await response.json();
    console.log("Vapi API response:", JSON.stringify(data));
    
    // Record the call in the ai_calls table if there's an issue ID
    if (issueId) {
      await fetch(
        'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/ai_calls',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
          body: JSON.stringify({
            issue_id: issueId,
            transcript: "Call initiated - transcript will be added when completed",
            duration: 0, // Will be updated when call completes
          }),
        }
      );
    }
    
    return { 
      success: true, 
      message: "Call initiated successfully", 
      callId: data.call_id 
    };
  } catch (error) {
    console.error("Error initiating call:", error);
    return { 
      success: false, 
      message: `Error initiating call: ${error.message}` 
    };
  }
}

// Handle webhook callbacks from Vapi
async function handleWebhook(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    console.log("Received webhook from Vapi:", JSON.stringify(body));
    
    const { type, call } = body;
    
    if (!call) {
      return new Response(JSON.stringify({ success: false, message: "No call data provided" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle different event types
    if (type === "call.completed") {
      // Call completed, update the database with transcript and duration
      if (call.metadata && call.metadata.issue_id) {
        const issueId = call.metadata.issue_id;
        const transcript = call.transcript || "No transcript available";
        const duration = call.duration || 0;
        
        // Update the AI call record with transcript and duration
        await fetch(
          `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/ai_calls?issue_id=eq.${issueId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              transcript: transcript,
              duration: duration,
              resolution: call.disposition || "unknown"
            }),
          }
        );
        
        // Add timeline entry for the call
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
              status: "Open", // Don't change the issue status
              note: `AI assistant call completed. Duration: ${Math.floor(duration / 60)} minutes, ${duration % 60} seconds.`
            }),
          }
        );
      }
    } else if (type === "call.failed") {
      // Call failed, update the database
      if (call.metadata && call.metadata.issue_id) {
        const issueId = call.metadata.issue_id;
        
        // Add timeline entry for the failed call
        await fetch(
          'https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issue_timeline',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}',
            },
            body: JSON.stringify({
              issue_id: issueId,
              status: "Open", // Don't change the issue status
              note: `AI assistant call failed. Reason: ${call.error || "Unknown error"}`
            }),
          }
        );
      }
    }
    
    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const url = new URL(req.url);
  
  // Handle webhooks from Vapi
  if (url.pathname.includes('/webhooks')) {
    return handleWebhook(req);
  }
  
  // Process the request based on the method
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log("Incoming request body:", JSON.stringify(body));
      
      const result = await initiateCall(body);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({ success: false, message: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }
  
  // Handle unexpected methods
  return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 405
  });
});
