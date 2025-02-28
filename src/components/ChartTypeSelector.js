import React from 'react';

const ChartTypeSelector = ({ chartType, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-2">Chart Type</h3>
      <select
        value={chartType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="price">Price over Time</option>
        <option value="size">Size over Time</option>
        <option value="spread">Bid-Ask Spread</option>
      </select>
    </div>
  );
};

export default ChartTypeSelector;
