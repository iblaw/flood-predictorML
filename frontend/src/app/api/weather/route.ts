import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
  }

  const startStr = "2026-08-10";
  const endStr = "2026-08-16";
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=precipitation_sum,soil_moisture_0_to_7cm_mean,weather_code,temperature_2m_max&timezone=Africa/Lagos`;

  try {
    // Next.js native fetch caching - revalidates every 1 hour (3600 seconds)
    const res = await fetch(url, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Open-Meteo' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
