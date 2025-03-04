import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

const TimeSeriesChart = ({ selectedFiles, getFilteredData }) => {
  // State for toggling visibility of price and size
  const [showPrice, setShowPrice] = useState(true);
  const [showSize, setShowSize] = useState(true);

  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

  // CustomTooltip component to format the tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Time: ${label.toFixed(2)}s`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed ? entry.value.toFixed(entry.name === 'Size' ? 0 : 4) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Toggle buttons for price and size visibility
  const renderToggleButtons = () => (
    <div className="flex space-x-2 mb-4">
      <button
        className={`px-3 py-1 rounded text-sm font-medium ${showPrice ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setShowPrice(!showPrice)}
      >
        {showPrice ? 'Hide Price' : 'Show Price'}
      </button>
      <button
        className={`px-3 py-1 rounded text-sm font-medium ${showSize ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setShowSize(!showSize)}
      >
        {showSize ? 'Hide Size' : 'Show Size'}
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {selectedFiles.map((fileId) => {
        const filteredData = getFilteredData(fileId);

        // Find min/max values for proper axis scaling
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        let minSize = Infinity;
        let maxSize = -Infinity;

        filteredData.forEach(point => {
          if (point.price !== undefined) {
            minPrice = Math.min(minPrice, point.price);
            maxPrice = Math.max(maxPrice, point.price);
          }
          if (point.size !== undefined) {
            minSize = Math.min(minSize, point.size);
            maxSize = Math.max(maxSize, point.size);
          }
        });

        // Add padding to the domains
        const pricePadding = (maxPrice - minPrice) * 0.05;
        const sizePadding = (maxSize - minSize) * 0.1;

        return (
          <div key={fileId} className="border rounded p-4 bg-white">
            <h3 className="text-lg font-medium mb-2">{fileId}</h3>

            {/* Render toggle buttons */}
            {renderToggleButtons()}

            <ResponsiveContainer width="100%" height={350} className="chart-responsive-container">
              <ComposedChart
                data={filteredData}
                margin={{ left: 35, right: 20, top: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="seconds_from_start"
                  label={{ value: 'Seconds from Start', position: 'insideBottom', offset: -10 }}
                  tickCount={10}
                  tickFormatter={(value) => value.toFixed(1)}
                />

                {/* Left Y-axis for Price */}
                {showPrice && (
                  <YAxis
                    yAxisId="left"
                    label={{ value: 'Price', angle: -90, position: 'insideLeft', offset: -30 }}
                    domain={[
                      minPrice !== Infinity ? minPrice - pricePadding : 0,
                      maxPrice !== -Infinity ? maxPrice + pricePadding : 0
                    ]}
                    tickCount={8}
                    tickFormatter={(value) => value.toFixed(2)}
                    width={60}
                  />
                )}

                {/* Right Y-axis for Size */}
                {showSize && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Size', angle: 90, position: 'insideRight', offset: 5 }}
                    domain={[
                      minSize !== Infinity ? minSize - sizePadding : 0,
                      maxSize !== -Infinity ? maxSize + sizePadding : 0
                    ]}
                    tickCount={8}
                    tickFormatter={(value) => Math.round(value)}
                    width={60}
                  />
                )}

                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                {/* Price Line */}
                {showPrice && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    dot={false}
                    name="Price"
                    isAnimationActive={false}
                  />
                )}

                {/* Size Line */}
                {showSize && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="size"
                    stroke="#82ca9d"
                    dot={false}
                    name="Size"
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};

export default TimeSeriesChart;