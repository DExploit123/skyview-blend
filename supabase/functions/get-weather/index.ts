import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, lat, lon, units } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    console.log('Fetching weather for:', location || `${lat},${lon}`, 'units:', units);

    // Get current weather and coordinates
    let currentResponse;
    if (lat && lon) {
      currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
      );
    } else {
      currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${apiKey}`
      );
    }

    if (!currentResponse.ok) {
      if (currentResponse.status === 404) {
        return new Response(JSON.stringify({ error: 'Location not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }

    const currentData = await currentResponse.json();
    
    // Get forecast data using coordinates
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&units=${units}&appid=${apiKey}`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    // Map weather condition codes to icon types
    const getIconType = (code: number): string => {
      if (code >= 200 && code < 300) return 'rain';
      if (code >= 300 && code < 400) return 'drizzle';
      if (code >= 500 && code < 600) return 'rain';
      if (code >= 600 && code < 700) return 'snow';
      if (code >= 700 && code < 800) return 'wind';
      if (code === 800) return 'sun';
      if (code === 801 || code === 802) return 'partly-cloudy';
      return 'cloud';
    };

    // Process hourly forecast (next 24 hours)
    const hourlyForecast = forecastData.list.slice(0, 8).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      icon: getIconType(item.weather[0].id),
      temperature: item.main.temp,
    }));

    // Process daily forecast (next 7 days)
    const dailyMap = new Map();
    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          day,
          icon: getIconType(item.weather[0].id),
          high: item.main.temp_max,
          low: item.main.temp_min,
        });
      } else {
        const existing = dailyMap.get(day);
        existing.high = Math.max(existing.high, item.main.temp_max);
        existing.low = Math.min(existing.low, item.main.temp_min);
      }
    });

    const dailyForecast = Array.from(dailyMap.values()).slice(0, 7);

    const weatherData = {
      location: currentData.name,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      temperature: currentData.main.temp,
      icon: getIconType(currentData.weather[0].id),
      feelsLike: currentData.main.feels_like,
      humidity: currentData.main.humidity,
      wind: currentData.wind.speed,
      precipitation: currentData.rain?.['1h'] || currentData.snow?.['1h'] || 0,
      hourlyForecast,
      dailyForecast,
    };

    console.log('Weather data fetched successfully');

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
