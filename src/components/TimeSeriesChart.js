import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, BarChart
} from 'recharts';

const TimeSeriesChart = ({ selectedFiles, getFilteredData }) => {
  // State for toggling visibility of price and size
  const [showPrice, setShowPrice] = useState(true);
  const [showSize, setShowSize] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);

  // Define number of bins for histogram
  const numBins = 20;
  // Set a limit on number of data points to prevent stack overflow
  const maxDataPointsForHistogram = 10000;

  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

  // CustomTooltip component to format the tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Time: ${label?.toFixed ? label.toFixed(2) : label}s`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed ? entry.value.toFixed(entry.name === 'Size' || entry.name.includes('Count') ? 0 : 4) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Function to create histogram data from the filtered time series data
  const createHistogramData = (filteredData, dataKey) => {
    if (!filteredData || filteredData.length === 0) return [];

    // Safety check - if data is too large, sample it
    let dataToProcess = filteredData;
    if (filteredData.length > maxDataPointsForHistogram) {
      const samplingRate = Math.ceil(filteredData.length / maxDataPointsForHistogram);
      dataToProcess = filteredData.filter((_, index) => index % samplingRate === 0);
      console.log(`Sampling data for histogram: using ${dataToProcess.length} of ${filteredData.length} points`);
    }

    // Extract all values for the given dataKey
    const values = dataToProcess
      .map(point => point[dataKey])
      .filter(val => val !== undefined && val !== null && !isNaN(val));

    if (values.length === 0) return [];

    // Find min and max values
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // If min and max are the same, can't create meaningful bins
    if (minValue === maxValue) {
      return [{
        binStart: minValue,
        binEnd: minValue,
        count: values.length,
        binLabel: minValue.toFixed(2)
      }];
    }

    // Calculate bin width - add a tiny amount to ensure the max value falls into the last bin
    const binWidth = ((maxValue - minValue) / numBins) + 0.000001;

    // Create bins
    const bins = Array(numBins).fill(0).map((_, i) => ({
      binStart: minValue + i * binWidth,
      binEnd: minValue + (i + 1) * binWidth,
      count: 0,
      binLabel: `${(minValue + i * binWidth).toFixed(2)}`
    }));

    // Count values in each bin
    values.forEach(val => {
      // Handle edge case for the maximum value
      if (val === maxValue) {
        bins[numBins - 1].count++;
        return;
      }

      const binIndex = Math.min(
        Math.floor((val - minValue) / binWidth),
        numBins - 1
      );

      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex].count++;
      }
    });

    return bins;
  };

  // Toggle buttons for chart visibility
  const renderToggleButtons = () => (
    <div className="flex flex-wrap space-x-2 mb-4">
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
      <button
        className={`px-3 py-1 rounded text-sm font-medium ${showHistogram ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => setShowHistogram(!showHistogram)}
      >
        {showHistogram ? 'Hide Histograms' : 'Show Histograms'}
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      {selectedFiles.map((fileId) => {
        const filteredData = getFilteredData(fileId);

        // Skip rendering if no data available
        if (!filteredData || filteredData.length === 0) {
          return (
            <div key={fileId} className="border rounded p-4 bg-white">
              <h3 className="text-lg font-medium mb-2">{fileId}</h3>
              <div className="text-center py-8">No data available for selected time range</div>
            </div>
          );
        }

        // Find min/max values for proper axis scaling
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        let minSize = Infinity;
        let maxSize = -Infinity;

        // Only process a sample of points for min/max calculation if data is large
        const sampleRate = filteredData.length > 10000 ? Math.ceil(filteredData.length / 10000) : 1;

        for (let i = 0; i < filteredData.length; i += sampleRate) {
          const point = filteredData[i];
          if (point.price !== undefined) {
            minPrice = Math.min(minPrice, point.price);
            maxPrice = Math.max(maxPrice, point.price);
          }
          if (point.size !== undefined) {
            minSize = Math.min(minSize, point.size);
            maxSize = Math.max(maxSize, point.size);
          }
        }

        // Add padding to the domains
        const pricePadding = (maxPrice - minPrice) * 0.05;
        const sizePadding = (maxSize - minSize) * 0.1;

        // Create histogram data when needed - no useMemo here to avoid Rules of Hooks errors
        let priceHistogram = [];
        let sizeHistogram = [];

        if (showHistogram && showPrice) {
          priceHistogram = createHistogramData(filteredData, 'price');
        }

        if (showHistogram && showSize) {
          sizeHistogram = createHistogramData(filteredData, 'size');
        }

        // Find max count for histograms for proper scaling
        const maxPriceCount = priceHistogram.length > 0 ? Math.max(...priceHistogram.map(bin => bin.count)) : 0;
        const maxSizeCount = sizeHistogram.length > 0 ? Math.max(...sizeHistogram.map(bin => bin.count)) : 0;

        // Data point count for display
        const dataPointCount = filteredData.length;

        return (
          <div key={fileId} className="border rounded p-4 bg-white">
            <h3 className="text-lg font-medium mb-2">{fileId}</h3>
            <div className="text-sm text-gray-500 mb-2">
              Showing {dataPointCount.toLocaleString()} data points
            </div>

            {/* Render toggle buttons */}
            {renderToggleButtons()}

            {/* Time Series Chart */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Time Series</h4>
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

            {/* Histograms */}
            {showHistogram && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Price Histogram */}
                {showPrice && priceHistogram.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Price Distribution</h4>
                    <ResponsiveContainer width="100%" height={250} className="chart-responsive-container">
                      <BarChart
                        data={priceHistogram}
                        margin={{ left: 20, right: 20, top: 10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="binLabel"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 0 }}
                          domain={[0, maxPriceCount * 1.1]}
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#8884d8" name="Price Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Size Histogram */}
                {showSize && sizeHistogram.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-2">Size Distribution</h4>
                    <ResponsiveContainer width="100%" height={250} className="chart-responsive-container">
                      <BarChart
                        data={sizeHistogram}
                        margin={{ left: 20, right: 20, top: 10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="binLabel"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis
                          label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 0 }}
                          domain={[0, maxSizeCount * 1.1]}
                          tickFormatter={(value) => value.toFixed(1)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#82ca9d" name="Size Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimeSeriesChart;