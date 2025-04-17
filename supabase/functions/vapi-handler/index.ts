
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Vapi configuration
const VAPI_BASE_URL = "https://api.vapi.ai";

async function initiateVapiCall(phoneNumber: string, issueId?: string, guestName?: string) {
  const vapiApiKey = Deno.env.get("VAPI_API_KEY");
  
  if (!vapiApiKey) {
    throw new Error("Vapi API key is not configured");
  }

  try {
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        assistantId: Deno.env.get("VAPI_ASSISTANT_ID"), // Ensure this is set in Supabase secrets
        metadata: {
          issueId,
          guestName,
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Vapi API error: ${errorBody}`);
    }

    const data = await response.json();
    return {
      success: true,
      callId: data.id
    };
  } catch (error) {
    console.error("Error initiating Vapi call:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phoneNumber, issueId, guestName } = await req.json();

    // Validate input
    if (!phoneNumber) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Phone number is required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Initiate Vapi call
    const result = await initiateVapiCall(phoneNumber, issueId, guestName);

    // If call is successful, log it in Supabase
    if (result.success && issueId) {
      await supabaseClient.from('ai_calls').insert({
        issue_id: issueId,
        duration: 0, // Will be updated when call completes
        timestamp: new Date().toISOString(),
        transcript: '', // Will be updated when call completes
        resolution: null
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  } catch (error) {
    console.error("Vapi handler error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
};

serve(handler);
