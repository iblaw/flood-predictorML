"use client";

import React from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import type { GridChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import ForecastCard, { LGA, BFFData } from '../app/forecasts/ForecastCard';

interface VirtualizedForecastGridProps {
  lgas: LGA[];
  bulkPredictions: Record<string, BFFData>;
  isBulkLoaded: boolean;
}

export default function VirtualizedForecastGrid({ lgas, bulkPredictions, isBulkLoaded }: VirtualizedForecastGridProps) {
  return (
    <div className="w-full" style={{ height: '80vh', minHeight: '600px' }}>
      <AutoSizer>
        {({ height, width }) => {
          let columnCount = 1;
          if (width >= 1024) { // lg
            columnCount = 3;
          } else if (width >= 640) { // sm
            columnCount = 2;
          }
          
          const rowCount = Math.ceil(lgas.length / columnCount);
          const columnWidth = width / columnCount;
          const rowHeight = width >= 640 ? columnWidth : 350; // Try to maintain aspect-square roughly on sm+, else 350px

          const Cell = ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
            const index = rowIndex * columnCount + columnIndex;
            if (index >= lgas.length) return null;

            const lga = lgas[index];
            return (
              <div style={{ ...style, padding: '16px' }}>
                <div className="w-full h-full">
                  <ForecastCard 
                    lga={lga} 
                    bulkData={bulkPredictions[lga.name]} 
                    isBulkLoaded={isBulkLoaded} 
                  />
                </div>
              </div>
            );
          };

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={width}
              className="scrollbar-hide"
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
}
