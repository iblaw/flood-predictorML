"use client";

import React from 'react';
import { Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

import ForecastCard, { LGA, BFFData } from '../app/forecasts/ForecastCard';

interface VirtualizedForecastGridProps {
  lgas: LGA[];
  bulkPredictions: Record<string, BFFData>;
  isBulkLoaded: boolean;
}

export default function VirtualizedForecastGrid({ lgas, bulkPredictions, isBulkLoaded }: VirtualizedForecastGridProps) {
  return (
    <div style={{ height: 'calc(100vh - 300px)', minHeight: '600px', width: '100%' }}>
      <AutoSizer
        renderProp={({ height, width }: { height: number | undefined; width: number | undefined }) => {
          if (width === undefined || height === undefined) {
            return null;
          }

          let columnCount = 1;
          if (width >= 1024) columnCount = 3;
          else if (width >= 640) columnCount = 2;

          const rowCount = Math.ceil(lgas.length / columnCount);
          const columnWidth = width / columnCount;
          const rowHeight = width >= 640 ? columnWidth : 350;

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowCount={rowCount}
              rowHeight={rowHeight}
              className="scrollbar-hide"
              style={{ height, width }}
              cellProps={{ lgas, bulkPredictions, isBulkLoaded, columnCount }}
              cellComponent={({ columnIndex, rowIndex, style, lgas, bulkPredictions, isBulkLoaded, columnCount }: any) => {
                const index = rowIndex * columnCount + columnIndex;
                if (index >= lgas.length) return null;

                const lga = lgas[index];
                const data = bulkPredictions[lga.name];

                return (
                  <div style={{ ...style, padding: '12px' }}>
                    <ForecastCard 
                      lga={lga} 
                      bulkData={data} 
                      isBulkLoaded={isBulkLoaded} 
                    />
                  </div>
                );
              }}
            />
          );
        }}
      />
    </div>
  );
}
