import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell } from "lucide-react";

interface WeatherPreferencesProps {
  userId: string;
}

export const WeatherPreferences = ({ userId }: WeatherPreferencesProps) => {
  const [preferences, setPreferences] = useState({
    alert_rain: true,
    alert_snow: true,
    alert_extreme_temp: true,
    alert_wind: false,
    notification_method: 'email',
    preferred_alert_time: '08:00:00',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    const { data, error } = await supabase
      .from('weather_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching preferences:', error);
      return;
    }

    if (data) {
      setPreferences(data);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('weather_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Weather Alert Preferences
        </CardTitle>
        <CardDescription>
          Customize your weather notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="rain">Rain Alerts</Label>
            <Switch
              id="rain"
              checked={preferences.alert_rain}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, alert_rain: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="snow">Snow Alerts</Label>
            <Switch
              id="snow"
              checked={preferences.alert_snow}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, alert_snow: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="temp">Extreme Temperature Alerts</Label>
            <Switch
              id="temp"
              checked={preferences.alert_extreme_temp}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, alert_extreme_temp: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="wind">High Wind Alerts</Label>
            <Switch
              id="wind"
              checked={preferences.alert_wind}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, alert_wind: checked })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Method</Label>
            <Select
              value={preferences.notification_method}
              onValueChange={(value) => 
                setPreferences({ ...preferences, notification_method: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Alert Time</Label>
            <Select
              value={preferences.preferred_alert_time}
              onValueChange={(value) => 
                setPreferences({ ...preferences, preferred_alert_time: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="06:00:00">6:00 AM</SelectItem>
                <SelectItem value="07:00:00">7:00 AM</SelectItem>
                <SelectItem value="08:00:00">8:00 AM</SelectItem>
                <SelectItem value="09:00:00">9:00 AM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
};