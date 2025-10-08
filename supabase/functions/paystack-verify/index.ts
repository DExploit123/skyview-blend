import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference');

    if (!reference) {
      console.error('No reference provided in callback');
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Payment Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Payment Error</h1>
            <p>No payment reference found.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>`,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 400 
        }
      );
    }

    console.log('Verifying payment reference:', reference);

    // Verify the payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      console.error('Payment verification failed:', paystackData);
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Payment Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Payment Failed</h1>
            <p>Your payment could not be verified. Please try again or contact support.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>`,
        { 
          headers: { 'Content-Type': 'text/html' },
          status: 400 
        }
      );
    }

    const { amount, metadata, paid_at } = paystackData.data;
    const { user_id, plan_type } = metadata;

    console.log('Payment successful:', { user_id, plan_type, amount });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate subscription dates
    const startDate = new Date(paid_at);
    const endDate = new Date(startDate);
    if (plan_type === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update subscription
    const { error: subError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id,
        plan_type,
        status: 'active',
        amount: amount / 100, // Convert from kobo to naira
        paystack_reference: reference,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

    if (subError) {
      console.error('Error updating subscription:', subError);
      throw subError;
    }

    // Create default weather preferences if they don't exist
    const { error: prefError } = await supabaseClient
      .from('weather_preferences')
      .upsert({
        user_id,
        alert_rain: true,
        alert_snow: true,
        alert_extreme_temp: true,
        alert_wind: false,
        notification_method: 'email',
        preferred_alert_time: '08:00:00',
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: true,
      });

    if (prefError) {
      console.log('Note: Weather preferences already exist or error:', prefError);
    }

    console.log('Subscription activated successfully');

    // Return success page with auto-redirect
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Successful</title>
          <meta http-equiv="refresh" content="3;url=/">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .success { 
              background: white;
              color: #10b981;
              padding: 40px;
              border-radius: 12px;
              max-width: 500px;
              margin: 0 auto;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .checkmark {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 { color: #10b981; margin: 0 0 20px 0; }
            p { color: #666; }
            a { color: #667eea; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="success">
            <div class="checkmark">✓</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for subscribing to Premium.</p>
            <p>You will be redirected in 3 seconds...</p>
            <p><a href="/">Click here if not redirected automatically</a></p>
          </div>
        </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in payment verification:', error);
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">An Error Occurred</h1>
          <p>We encountered an error processing your payment. Please contact support.</p>
          <p><a href="/">Return to Home</a></p>
        </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 500 
      }
    );
  }
});
