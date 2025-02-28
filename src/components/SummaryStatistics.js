import React from 'react';

const SummaryStatistics = ({ selectedFiles, summaryData }) => {
  if (selectedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">Select a file to display statistics</p>
      </div>
    );
  }

  // Use the first selected file
  const fileId = selectedFiles[0];
  const data = summaryData[fileId] || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-medium mb-2">File Information</h3>
        <table className="min-w-full">
          <tbody>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Total Records</td>
              <td className="py-1 text-sm">{data.total_records}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Unique Symbols</td>
              <td className="py-1 text-sm">{data.unique_symbols}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Symbol</td>
              <td className="py-1 text-sm">{data.unique_symbol_list}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Ask Count</td>
              <td className="py-1 text-sm">{data.ask_count}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Bid Count</td>
              <td className="py-1 text-sm">{data.bid_count}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-medium mb-2">Price & Size Statistics</h3>
        <table className="min-w-full">
          <tbody>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Min Price</td>
              <td className="py-1 text-sm">{data.min_price}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Max Price</td>
              <td className="py-1 text-sm">{data.max_price}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Avg Price</td>
              <td className="py-1 text-sm">{data.avg_price}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Price StdDev</td>
              <td className="py-1 text-sm">{data.price_std_dev}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Min Size</td>
              <td className="py-1 text-sm">{data.min_size}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Max Size</td>
              <td className="py-1 text-sm">{data.max_size}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Avg Size</td>
              <td className="py-1 text-sm">{data.avg_size}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:col-span-2">
        <h3 className="font-medium mb-2">Time Information</h3>
        <table className="min-w-full">
          <tbody>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">Start Time</td>
              <td className="py-1 text-sm">{data.start_time}</td>
            </tr>
            <tr>
              <td className="pr-4 py-1 text-sm font-medium text-gray-600">End Time</td>
              <td className="py-1 text-sm">{data.end_time}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryStatistics;