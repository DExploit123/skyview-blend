-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Create subscriptions table to track premium users
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status subscription_status NOT NULL DEFAULT 'expired',
  plan_type TEXT NOT NULL, -- 'monthly' or 'yearly'
  amount NUMERIC NOT NULL,
  paystack_reference TEXT UNIQUE,
  paystack_subscription_code TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create weather preferences table for personalized alerts
CREATE TABLE public.weather_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_rain BOOLEAN DEFAULT true,
  alert_snow BOOLEAN DEFAULT true,
  alert_extreme_temp BOOLEAN DEFAULT true,
  alert_wind BOOLEAN DEFAULT false,
  notification_method TEXT DEFAULT 'email', -- 'email' or 'push'
  preferred_alert_time TIME DEFAULT '08:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on weather_preferences
ALTER TABLE public.weather_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for weather_preferences
CREATE POLICY "Users can view their own preferences"
ON public.weather_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.weather_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.weather_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updating subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updating weather_preferences updated_at
CREATE TRIGGER update_weather_preferences_updated_at
BEFORE UPDATE ON public.weather_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = user_uuid
      AND status = 'active'
      AND end_date > now()
  )
$$;