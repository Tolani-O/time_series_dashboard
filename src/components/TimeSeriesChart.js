import React, { useState, useEffect } from 'react';
import FileChart from './FileChart'; // Import the extracted FileChart component

// Main TimeSeriesChart component
const TimeSeriesChart = ({ selectedFiles, getFilteredData, binCount = 20 }) => {
  // State for toggling visibility of price and size
  const [showPrice, setShowPrice] = useState(true);
  const [showSize, setShowSize] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);
  const [histogramBinCount, setHistogramBinCount] = useState(binCount);

  // When binCount prop changes, update histogramBinCount
  useEffect(() => {
    setHistogramBinCount(binCount);
  }, [binCount]);

  if (selectedFiles.length === 0) {
    return <div className="text-center mt-8">Select files to visualize</div>;
  }

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

  // Handler for bin count changes
  const handleBinCountChange = (newValue) => {
    setHistogramBinCount(newValue);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="border rounded p-4 bg-white">
        {renderToggleButtons()}
          {selectedFiles.map((fileId) => {
            const filteredData = getFilteredData(fileId);

            return (
              <FileChart
                key={fileId}
                fileId={fileId}
                filteredData={filteredData}
                showPrice={showPrice}
                showSize={showSize}
                showHistogram={showHistogram}
                histogramBinCount={histogramBinCount}
                onBinCountChange={handleBinCountChange}
              />
            );
          })}
      </div>
    </div>
  );
};

export default TimeSeriesChart;
