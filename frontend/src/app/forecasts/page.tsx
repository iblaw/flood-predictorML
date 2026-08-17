import React from 'react';
import fs from 'fs';
import path from 'path';
import ForecastClient from './ForecastClient';
import { LGA } from './ForecastCard';

export default async function ForecastsPage() {
  // Read the parsed JSON from the server side
  const lgasFilePath = path.join(process.cwd(), 'src', 'data', 'lgas.json');
  let lgas: LGA[] = [];
  
  try {
    const fileContents = fs.readFileSync(lgasFilePath, 'utf8');
    lgas = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read lgas.json:", error);
  }

  return (
    <ForecastClient lgas={lgas} />
  );
}
