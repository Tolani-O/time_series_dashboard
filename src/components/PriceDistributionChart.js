import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PriceDistributionChart = ({ selectedFiles, priceDistData }) => {
  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {selectedFiles.map(fileId => (
        <div key={fileId} className="border rounded p-4 bg-white">
          <h3 className="text-lg font-medium mb-2">{fileId} - Price Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistData[fileId] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="price_bin"
                label={{ value: 'Price', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ask" fill="#8884d8" />
              <Bar dataKey="Bid" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default PriceDistributionChart;
