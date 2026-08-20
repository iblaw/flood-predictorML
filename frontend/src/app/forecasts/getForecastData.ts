import { supabase } from '@/lib/supabase';
import { BFFData } from './ForecastCard';

export async function getForecastData(): Promise<{
  last_updated: string | null;
  total_locations: number;
  predictions: Record<string, BFFData>;
}> {
  try {
    const { data: rows, error } = await supabase
      .from('flood_predictions')
      .select('*');

    if (error) {
      console.error("Database fetch failed from Supabase:", error);
      return { last_updated: null, total_locations: 0, predictions: {} };
    }

    if (!rows || rows.length === 0) {
      return { last_updated: null, total_locations: 0, predictions: {} };
    }

    const predictions: Record<string, BFFData> = {};
    const last_updated = rows[0]?.last_updated || null;

    for (const row of rows) {
      // Parse explanation if it's stored as JSON string or fallback to array
      let parsedExplanation: string[] = [];
      if (row.explanation) {
        if (typeof row.explanation === 'string') {
          try {
            parsedExplanation = JSON.parse(row.explanation);
          } catch {
            parsedExplanation = [row.explanation];
          }
        } else if (Array.isArray(row.explanation)) {
          parsedExplanation = row.explanation;
        }
      }

      // Parse raw_inputs if it's stored as JSON string
      let parsedRawInputs: any = {};
      if (row.raw_inputs) {
        if (typeof row.raw_inputs === 'string') {
          try {
            parsedRawInputs = JSON.parse(row.raw_inputs);
          } catch {
            parsedRawInputs = {};
          }
        } else {
          parsedRawInputs = row.raw_inputs;
        }
      }

      predictions[row.lga_name] = {
        tier: row.tier,
        risk_level: row.status === "AT RISK" ? 1 : 0,
        risk_24h: row.risk_24h !== null && row.risk_24h !== undefined ? parseFloat(row.risk_24h) : undefined,
        risk_48h: row.risk_48h !== null && row.risk_48h !== undefined ? parseFloat(row.risk_48h) : undefined,
        risk_72h: row.risk_72h !== null && row.risk_72h !== undefined ? parseFloat(row.risk_72h) : undefined,
        weather: {
          rainfall_7d: row.rainfall_7d !== null && row.rainfall_7d !== undefined ? parseFloat(row.rainfall_7d) : 0,
          soil_moisture_7d: row.soil_moisture_7d !== null && row.soil_moisture_7d !== undefined ? parseFloat(row.soil_moisture_7d) : 0,
          runoff_potential: parsedRawInputs.Runoff_Potential !== undefined ? parseFloat(parsedRawInputs.Runoff_Potential) : 0,
          elevation: row.elevation !== null && row.elevation !== undefined ? parseFloat(row.elevation) : undefined,
        },
        explanation: parsedExplanation,
      };
    }

    return {
      last_updated,
      total_locations: Object.keys(predictions).length,
      predictions
    };
  } catch (error) {
    console.error("Failed to fetch forecast data:", error);
    return { last_updated: null, total_locations: 0, predictions: {} };
  }
}
