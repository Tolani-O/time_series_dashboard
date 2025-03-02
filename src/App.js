import React, { useState, useEffect } from 'react';
import FileSelector from './components/FileSelector';
import TimeRangeSlider from './components/TimeRangeSlider';
import ChartTypeSelector from './components/ChartTypeSelector';
import TimeSeriesChart from './components/TimeSeriesChart';
import PriceDistributionChart from './components/PriceDistributionChart';
import VolumeDistributionChart from './components/VolumeDistributionChart';
import BidAskSpreadChart from './components/BidAskSpreadChart';
import SummaryStatistics from './components/SummaryStatistics';
import { loadFileData, getFiles } from './utils/dataLoader'; // Importing the new loadFileData function

function App() {
  // State management
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState({});
  const [priceDistData, setPriceDistData] = useState({});
  const [volumeDistData, setVolumeDistData] = useState({});
  const [bidAskData, setBidAskData] = useState({});
  const [summaryData, setSummaryData] = useState({});
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [chartType, setChartType] = useState('price');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadMockFiles] = useState(false); // New state to determine file loading type

  // Find available data files
  useEffect(() => {
    const fetchFiles = async () => {
      const filesList = await getFiles(loadMockFiles); // Use getFiles to fetch files
      setFiles(filesList);
    };

    fetchFiles().then(r => console.log('Files loaded:', r));
  }, [loadMockFiles]); // Dependency on loadMockFiles

  // Handler for file selection
  const handleFileSelect = async (fileId) => {
    setLoading(true);
    setError(null);

    if (selectedFiles.includes(fileId)) {
      // Deselecting the file
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
      setLoading(false); // Stop loading since we are deselecting
    } else {
      // Selecting the file
      setSelectedFiles([...selectedFiles, fileId]);

      // Load the selected file data
      try {
        const data = await loadFileData(fileId, loadMockFiles); // Pass true for mock data, or false for CSV data
        setTimeSeriesData(prev => ({...prev, [fileId]: data.timeSeriesData}));
        setPriceDistData(prev => ({...prev, [fileId]: data.priceDistData}));
        setVolumeDistData(prev => ({...prev, [fileId]: data.volumeDistData}));
        setBidAskData(prev => ({...prev, [fileId]: data.bidAskData}));
        setSummaryData(prev => ({...prev, [fileId]: data.summaryData}));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Time range change handlers
  const handleTimeRangeChange = (start, end) => {
    setTimeRange([start, end]);
  };

  // Chart type change handler
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  // Function to filter time series data based on time range
  const getFilteredTimeSeriesData = (fileId) => {
    if (!timeSeriesData[fileId]) return [];

    const data = timeSeriesData[fileId];
    const min = timeRange[0];
    const max = timeRange[1];

    return data.filter(d =>
      d.seconds_from_start >= min && d.seconds_from_start <= max
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 transition duration-300 ease-in-out">
      {/* Updated Header with Gradient, Shadow, and Rounded Corners */}
      <header className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-white">Futures Tick Data Visualization</h1>
          <p className="text-gray-200 mt-2">
            Interactive visualization of futures contract tick data with nanosecond precision
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Updated Sidebar/Controls with Card Styling */}
        <div className="col-span-1 bg-white p-6 rounded-lg border shadow-md">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>

          {/* File Selector Component */}
          <FileSelector
            files={files}
            selectedFiles={selectedFiles}
            onSelectFile={handleFileSelect}
            loading={loading}
          />

          {/* Time Range Slider Component */}
          <TimeRangeSlider
            timeRange={timeRange}
            onChange={handleTimeRangeChange}
          />

          {/* Chart Type Selector Component */}
          <ChartTypeSelector
            chartType={chartType}
            onChange={handleChartTypeChange}
          />

          {/* Status Messages */}
          {loading && (
            <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">
              Loading data...
            </div>
          )}
          {error && (
            <div className="p-2 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {/* Time Series Analysis */}
          <div className="bg-white p-6 rounded-lg border shadow-md transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Time Series Analysis</h2>
              <div className="text-sm text-gray-500">
                Showing data from {timeRange[0]}s to {timeRange[1]}s
              </div>
            </div>
            <TimeSeriesChart
              selectedFiles={selectedFiles}
              timeSeriesData={timeSeriesData}
              bidAskData={bidAskData}
              chartType={chartType}
              getFilteredData={getFilteredTimeSeriesData}
            />
          </div>

          {/* Price and Volume Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-md transition transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4">Price Distribution</h2>
              <PriceDistributionChart
                selectedFiles={selectedFiles}
                priceDistData={priceDistData}
              />
            </div>
            <div className="bg-white p-6 rounded-lg border shadow-md transition transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4">Volume Distribution</h2>
              <VolumeDistributionChart
                selectedFiles={selectedFiles}
                volumeDistData={volumeDistData}
              />
            </div>
          </div>

          {/* Bid-Ask Spread Analysis */}
          <div className="bg-white p-6 rounded-lg border shadow-md transition transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4">Bid-Ask Spread Analysis</h2>
            <BidAskSpreadChart
              selectedFiles={selectedFiles}
              bidAskData={bidAskData}
            />
          </div>

          {/* Summary Statistics */}
          <div className="bg-white p-6 rounded-lg border shadow-md transition transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
            <SummaryStatistics
              selectedFiles={selectedFiles}
              summaryData={summaryData}
            />
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Futures Contract Tick Data Visualization Tool</p>
      </footer>
    </div>
  );
}

export default App;