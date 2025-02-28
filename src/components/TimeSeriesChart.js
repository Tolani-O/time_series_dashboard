import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';

const TimeSeriesChart = ({ selectedFiles, timeSeriesData, bidAskData, chartType, getFilteredData }) => {
  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {selectedFiles.map((fileId) => (
        <div key={fileId} className="border rounded p-4 bg-white">
          <h3 className="text-lg font-medium mb-2">{fileId}</h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'price' ? (
              <LineChart data={getFilteredData(fileId)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="seconds_from_start"
                  label={{ value: 'Seconds from Start', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Price', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  dot={false}
                  name="Price"
                />
              </LineChart>
            ) : chartType === 'size' ? (
              <LineChart data={getFilteredData(fileId)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="seconds_from_start"
                  label={{ value: 'Seconds from Start', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Size', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="size"
                  stroke="#82ca9d"
                  dot={false}
                  name="Size"
                />
              </LineChart>
            ) : (
              <ComposedChart data={bidAskData[fileId] || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="seconds_from_start"
                  label={{ value: 'Seconds from Start', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: 'Price', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="min_ask"
                  stroke="#ff7300"
                  name="Min Ask"
                />
                <Line
                  type="monotone"
                  dataKey="max_bid"
                  stroke="#387908"
                  name="Max Bid"
                />
                <Area
                  type="monotone"
                  dataKey="spread"
                  fill="#8884d8"
                  stroke="#8884d8"
                  opacity={0.3}
                  name="Spread"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default TimeSeriesChart;
