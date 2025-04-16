
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY');
const VAPI_BASE_URL = 'https://api.vapi.ai/api';

interface InboundCallResponse {
  success: boolean;
  message: string;
  callId?: string;
}

interface OutboundCallResponse {
  success: boolean;
  message: string;
  callId?: string;
}

// Process inbound call from Vapi
async function handleInboundCall(request: any): Promise<InboundCallResponse> {
  console.log("Handling inbound call webhook from Vapi");
  
  try {
    // Process the webhook data from Vapi
    const { call_id, status, transcript, entities, recording_url } = request;
    
    // Log call details
    console.log(`Call ID: ${call_id}, Status: ${status}`);
    
    if (status === "completed" && transcript) {
      console.log(`Transcript: ${transcript}`);
      
      // Extract issue details from the transcript
      const issueTitle = entities?.issue_title || "Maintenance issue reported via phone";
      const issueDescription = transcript;
      const propertyId = entities?.property_id;
      const priority = entities?.priority || "Medium";
      
      // If we have enough info, create an issue in the database
      if (propertyId) {
        const { data: supabaseClient } = await fetch(
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
              property_id: propertyId,
              priority: priority,
              status: "Open",
              source: "Phone"
            }),
          }
        );
        
        // Create AI call record
        if (call_id) {
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
                transcript: transcript,
                duration: request.duration || 0,
                issue_id: supabaseClient?.id,
                resolution: "Issue created from phone call"
              }),
            }
          );
        }
        
        return { 
          success: true, 
          message: "Issue created successfully from inbound call", 
          callId: call_id 
        };
      }
      
      return { 
        success: true, 
        message: "Call processed but insufficient data to create issue", 
        callId: call_id 
      };
    }
    
    return { 
      success: true, 
      message: `Call ${status}`, 
      callId: call_id 
    };
  } catch (error) {
    console.error("Error processing inbound call:", error);
    return { 
      success: false, 
      message: `Error processing inbound call: ${error.message}` 
    };
  }
}

// Initiate outbound call using Vapi
async function initiateOutboundCall(body: any): Promise<OutboundCallResponse> {
  try {
    const { phoneNumber, issueId, guestName } = body;
    
    if (!phoneNumber) {
      return { success: false, message: "Phone number is required" };
    }
    
    // Get issue details if issueId is provided
    let issueDetails = null;
    if (issueId) {
      const issueResponse = await fetch(
        `https://sjxeupeggseedybibyzx.supabase.co/rest/v1/issues?id=eq.${issueId}&select=*,property:properties(*)`,
        {
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          },
        }
      );
      
      if (issueResponse.ok) {
        const issues = await issueResponse.json();
        if (issues && issues.length > 0) {
          issueDetails = issues[0];
        }
      }
    }
    
    // Prepare assistant configuration for Vapi
    const assistantConfig = {
      first_message: `Hello${guestName ? ' ' + guestName : ''}, this is AI Maintenance Assistant calling about ${issueDetails ? 'a maintenance issue at ' + issueDetails.property?.name : 'a maintenance issue'}. ${issueDetails ? 'The issue reported was: ' + issueDetails.title : ''}`,
      model: {
        provider: "openai",
        model_name: "gpt-4",
        temperature: 0.7,
      },
      voice: {
        provider: "11labs",
        voice_id: "rachel",
      }
    };
    
    // Make outbound call request to Vapi
    const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        to: phoneNumber,
        assistant_id: "maintenance-assistant", // You would create this in Vapi dashboard
        ...assistantConfig,
        metadata: {
          issue_id: issueId,
        },
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vapi outbound call error:", errorText);
      return { success: false, message: `Failed to initiate call: ${errorText}` };
    }
    
    const responseData = await response.json();
    
    // Create AI call record in database
    if (responseData.call_id && issueId) {
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
            transcript: "Outbound call initiated",
            duration: 0, // Will be updated when call completes
            issue_id: issueId,
            resolution: "Outbound call to guest"
          }),
        }
      );
    }
    
    return { 
      success: true, 
      message: "Call initiated successfully", 
      callId: responseData.call_id 
    };
  } catch (error) {
    console.error("Error initiating outbound call:", error);
    return { 
      success: false, 
      message: `Error initiating call: ${error.message}` 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Ensure we have the Vapi API key
  if (!VAPI_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, message: "VAPI_API_KEY is not configured" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  try {
    const url = new URL(req.url);
    const body = await req.json();
    
    console.log(`Received request to ${url.pathname}`);
    
    // Determine which function to call based on the request body's purpose field
    if (url.pathname.includes('/inbound') || body.call_id) {
      const result = await handleInboundCall(body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
      );
    }
    
    // If it's not an inbound call, assume it's an outbound call request
    const result = await initiateOutboundCall(body);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ success: false, message: `Error processing request: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
