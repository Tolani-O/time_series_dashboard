import React from 'react';

const TimeRangeSlider = ({ timeRange, onChange, maxTimeValue = 1000 }) => {
  // Default maxTimeValue is 1000 if no data is loaded yet

  const handleStartChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    // Ensure start time doesn't exceed end time
    if (newStart <= timeRange[1]) {
      onChange(newStart, timeRange[1]);
    } else {
      onChange(timeRange[1], timeRange[1]);
    }
  };

  const handleEndChange = (e) => {
    const newEnd = parseInt(e.target.value, 10);
    // Ensure end time isn't less than start time
    if (newEnd >= timeRange[0]) {
      onChange(timeRange[0], newEnd);
    } else {
      onChange(timeRange[0], timeRange[0]);
    }
  };

  // Calculate step size based on max time value
  // For smaller ranges, smaller steps make more sense
  const calculateStep = () => {
    if (maxTimeValue <= 100) return 1;
    if (maxTimeValue <= 500) return 5;
    if (maxTimeValue <= 1000) return 10;
    return Math.ceil(maxTimeValue / 100);
  };

  const step = calculateStep();

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-2">Time Range</h3>

      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Total data range: 0s - {maxTimeValue}s</span>
        <span>Selected: {timeRange[0]}s - {timeRange[1]}s</span>
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600 block">Start Time (seconds)</label>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max={maxTimeValue}
            step={step}
            value={timeRange[0]}
            onChange={handleStartChange}
            className="w-full mr-2"
          />
          <input
            type="number"
            min="0"
            max={maxTimeValue}
            value={timeRange[0]}
            onChange={handleStartChange}
            className="w-16 px-2 py-1 border rounded text-right"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 block">End Time (seconds)</label>
        <div className="flex items-center">
          <input
            type="range"
            min="0"
            max={maxTimeValue}
            step={step}
            value={timeRange[1]}
            onChange={handleEndChange}
            className="w-full mr-2"
          />
          <input
            type="number"
            min="0"
            max={maxTimeValue}
            value={timeRange[1]}
            onChange={handleEndChange}
            className="w-16 px-2 py-1 border rounded text-right"
          />
        </div>
      </div>

      {/* Quick selection buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onChange(0, maxTimeValue)}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          All Data
        </button>
        <button
          onClick={() => onChange(0, Math.min(100, maxTimeValue))}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          First 100s
        </button>
        <button
          onClick={() => onChange(Math.max(0, maxTimeValue - 100), maxTimeValue)}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          Last 100s
        </button>
        <button
          onClick={() => {
            const mid = Math.floor(maxTimeValue / 2);
            onChange(Math.max(0, mid - 50), Math.min(maxTimeValue, mid + 50));
          }}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
        >
          Middle 100s
        </button>
      </div>
    </div>
  );
};

export default TimeRangeSlider;