import React from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const BidAskSpreadChart = ({ selectedFiles, bidAskData }) => {
  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {selectedFiles.map(fileId => {
        const spreads = bidAskData[fileId]?.map(d => d.spread) || [];
        
        // Calculate box plot data
        const sortedSpreads = [...spreads].sort((a, b) => a - b);
        const min = sortedSpreads[0] || 0;
        const max = sortedSpreads[sortedSpreads.length - 1] || 1;
        const q1 = sortedSpreads[Math.floor(sortedSpreads.length * 0.25)] || min;
        const median = sortedSpreads[Math.floor(sortedSpreads.length * 0.5)] || (min + max) / 2;
        const q3 = sortedSpreads[Math.floor(sortedSpreads.length * 0.75)] || max;
        
        return (
          <div key={fileId} className="border rounded p-4 bg-white">
            <h3 className="text-lg font-medium mb-2">{fileId} - Bid-Ask Spread</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={bidAskData[fileId] || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="seconds_from_start" 
                  label={{ value: 'Seconds from Start', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Spread', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="spread" 
                  stroke="#8884d8" 
                  name="Spread" 
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Spread Statistics</h4>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xs text-gray-500">Min</div>
                  <div>{min.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xs text-gray-500">Q1</div>
                  <div>{q1.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xs text-gray-500">Median</div>
                  <div>{median.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xs text-gray-500">Q3</div>
                  <div>{q3.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <div className="text-xs text-gray-500">Max</div>
                  <div>{max.toFixed(4)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BidAskSpreadChart;
