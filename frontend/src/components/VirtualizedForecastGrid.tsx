"use client";

import React from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import ForecastCard, { LGA, BFFData } from '../app/forecasts/ForecastCard';

interface VirtualizedForecastGridProps {
  lgas: LGA[];
  bulkPredictions: Record<string, BFFData>;
  isBulkLoaded: boolean;
}

interface CellRendererProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    lgas: LGA[];
    bulkPredictions: Record<string, BFFData>;
    isBulkLoaded: boolean;
    columnCount: number;
  };
}

function CellRenderer({ columnIndex, rowIndex, style, data }: CellRendererProps) {
  const { lgas, bulkPredictions, isBulkLoaded, columnCount } = data;
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
}

export default function VirtualizedForecastGrid({ lgas, bulkPredictions, isBulkLoaded }: VirtualizedForecastGridProps) {
  return (
    <div className="flex-1 relative w-full">
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => {
          let columnCount = 1;
          if (width >= 1024) {
            columnCount = 3;
          } else if (width >= 640) {
            columnCount = 2;
          }

          const rowCount = Math.ceil(lgas.length / columnCount);
          const columnWidth = width / columnCount;
          const rowHeight = width >= 640 ? columnWidth : 350;

          return (
            <FixedSizeGrid
              columnCount={columnCount}
              columnWidth={columnWidth}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              width={width}
              itemData={{ lgas, bulkPredictions, isBulkLoaded, columnCount }}
              className="scrollbar-hide"
            >
              {CellRenderer}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
}
