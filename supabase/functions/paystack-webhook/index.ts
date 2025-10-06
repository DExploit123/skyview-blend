import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY') + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    if (event.event === 'charge.success') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data, metadata, reference, amount } = event.data;
      const userId = metadata.user_id;
      const planType = metadata.plan_type;

      // Calculate end date based on plan
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (planType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Upsert subscription
      const { error: subError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_type: planType,
          amount: amount / 100, // Convert from kobo to naira
          paystack_reference: reference,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (subError) {
        console.error('Error updating subscription:', subError);
        throw subError;
      }

      // Create default weather preferences if not exists
      const { error: prefError } = await supabaseClient
        .from('weather_preferences')
        .upsert({
          user_id: userId,
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: true
        });

      if (prefError) {
        console.error('Error creating preferences:', prefError);
      }

      console.log('Subscription activated for user:', userId);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});