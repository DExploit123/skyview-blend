import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export const PremiumModal = ({ open, onOpenChange, userEmail }: PremiumModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paystack-initialize', {
        body: { email: userEmail, plan },
      });

      if (error) throw error;

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Personalized weather alerts",
    "Extended 5-day forecasts",
    "Travel mode with route recommendations",
    "Ad-free experience",
    "Priority AI chat support",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-primary" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Unlock advanced weather features and personalized alerts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Premium Features:</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h4 className="font-semibold">Monthly</h4>
                <p className="text-2xl font-bold">₦500<span className="text-sm font-normal">/month</span></p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Subscribe Monthly'}
              </Button>
            </div>

            <div className="rounded-lg border-2 border-primary p-4 space-y-3 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                Best Value
              </div>
              <div>
                <h4 className="font-semibold">Yearly</h4>
                <p className="text-2xl font-bold">₦5,000<span className="text-sm font-normal">/year</span></p>
                <p className="text-xs text-muted-foreground">Save ₦1,000/year</p>
              </div>
              <Button
                className="w-full"
                onClick={() => handleSubscribe('yearly')}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Subscribe Yearly'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};