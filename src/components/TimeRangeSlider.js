import React from 'react';

const TimeRangeSlider = ({ timeRange, onChange }) => {
  const handleStartChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    onChange(newStart, timeRange[1]);
  };

  const handleEndChange = (e) => {
    const newEnd = parseInt(e.target.value, 10);
    onChange(timeRange[0], newEnd);
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-2">Time Range</h3>
      <div className="mb-2">
        <label className="text-sm text-gray-600 block">Start Time (seconds)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={timeRange[0]}
          onChange={handleStartChange}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-right">{timeRange[0]}s</div>
      </div>
      <div>
        <label className="text-sm text-gray-600 block">End Time (seconds)</label>
        <input
          type="range"
          min="50"
          max="1000"
          value={timeRange[1]}
          onChange={handleEndChange}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-right">{timeRange[1]}s</div>
      </div>
    </div>
  );
};

export default TimeRangeSlider;
