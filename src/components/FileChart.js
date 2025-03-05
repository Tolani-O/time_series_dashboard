import React, { useMemo } from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import createHistogramsData from '../utils/histogramUtils';

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

// FileChart component to handle a single file's visualization
const FileChart = ({ fileId, filteredData, showPrice, showSize, showHistogram, histogramBinCount, onBinCountChange }) => {
  // Memoize time series data processing
  const timeSeriesData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { minPrice: 0, maxPrice: 0, minSize: 0, maxSize: 0, dataPointCount: 0 };
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

    return {
      minPrice: minPrice !== Infinity ? minPrice - pricePadding : 0,
      maxPrice: maxPrice !== -Infinity ? maxPrice + pricePadding : 0,
      minSize: minSize !== Infinity ? minSize - sizePadding : 0,
      maxSize: maxSize !== -Infinity ? maxSize + sizePadding : 0,
      dataPointCount: filteredData.length
    };
  }, [filteredData]); // Only recalculate when filteredData changes

  // Memoize histogram calculations
  const histogramData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        priceHistogram: [],
        sizeHistogram: [],
        maxPriceCount: 0,
        maxSizeCount: 0
      };
    }

    // Determine which histograms to create based on visibility settings
    const histogramKeys = [];
    if (showHistogram) {
      if (showPrice) histogramKeys.push('price');
      if (showSize) histogramKeys.push('size');
    }

    // Skip calculation if no histograms needed
    if (histogramKeys.length === 0) {
      return {
        priceHistogram: [],
        sizeHistogram: [],
        maxPriceCount: 0,
        maxSizeCount: 0
      };
    }

    // Create histograms in parallel using Web Worker or async computation
    // For now, we'll use the existing synchronous function
    const histograms = createHistogramsData(filteredData, histogramKeys, histogramBinCount);

    // Get individual histograms from the result
    const priceHistogram = histograms.price || [];
    const sizeHistogram = histograms.size || [];

    // Find max count for histograms for proper scaling
    const maxPriceCount = priceHistogram.length > 0 ? Math.max(...priceHistogram.map(bin => bin.count)) : 0;
    const maxSizeCount = sizeHistogram.length > 0 ? Math.max(...sizeHistogram.map(bin => bin.count)) : 0;

    return {
      priceHistogram,
      sizeHistogram,
      maxPriceCount,
      maxSizeCount
    };
  }, [filteredData, showPrice, showSize, histogramBinCount, showHistogram]);

  // If no data available, show message
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="border rounded p-4 bg-white">
        <h3 className="text-lg font-medium mb-2">{fileId}</h3>
        <div className="text-center py-8">No data available for selected time range</div>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="text-lg font-medium mb-2">{fileId}</h3>
      <div className="text-sm text-gray-500 mb-2">
        Showing {timeSeriesData.dataPointCount.toLocaleString()} data points
      </div>

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
                domain={[timeSeriesData.minPrice, timeSeriesData.maxPrice]}
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
                domain={[timeSeriesData.minSize, timeSeriesData.maxSize]}
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
        <>
          {/* Bin count selection */}
          <div className="mb-4">
            <label htmlFor="binCountSelector" className="block text-sm font-medium text-gray-700 mb-2">
              Histogram Bin Count:
            </label>
            <div className="relative">
              <select
                id="binCountSelector"
                value={histogramBinCount}
                onChange={(e) => onBinCountChange(Number(e.target.value))}
                className="appearance-none cursor-pointer bg-white w-40 py-2 px-4 pr-8 border border-gray-300 rounded-md shadow-sm min-h-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10"
              >
                {[10, 20, 30, 50, 100].map(option => (
                  <option key={option} value={option} className="py-1">
                    {option} bins
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Price Histogram */}
          {showPrice && histogramData.priceHistogram.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">Price Distribution ({histogramBinCount} bins)</h4>
              <ResponsiveContainer width="100%" height={250} className="chart-responsive-container">
                <ComposedChart
                  data={histogramData.priceHistogram}
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
                    domain={[0, histogramData.maxPriceCount * 1.1]}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="stepAfter"
                    dataKey="count"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    name="Price Count"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Size Histogram */}
          {showSize && histogramData.sizeHistogram.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">Size Distribution ({histogramBinCount} bins)</h4>
              <ResponsiveContainer width="100%" height={250} className="chart-responsive-container">
                <ComposedChart
                  data={histogramData.sizeHistogram}
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
                    domain={[0, histogramData.maxSizeCount * 1.1]}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="stepAfter"
                    dataKey="count"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    name="Size Count"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default FileChart;
