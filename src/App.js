import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import Papa from 'papaparse';
import FileSelector from './components/FileSelector';
import TimeRangeSlider from './components/TimeRangeSlider';
import ChartTypeSelector from './components/ChartTypeSelector';
import TimeSeriesChart from './components/TimeSeriesChart';
import PriceDistributionChart from './components/PriceDistributionChart';
import VolumeDistributionChart from './components/VolumeDistributionChart';
import BidAskSpreadChart from './components/BidAskSpreadChart';
import SummaryStatistics from './components/SummaryStatistics';
import { loadCSVFile } from './utils/fileHandlers';

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

  // Find available data files
  useEffect(() => {
    // This would be replaced with actual file discovery
    const mockFiles = [
      {
        id: 'GLBX-20250227-P8LQFHG7JM',
        name: 'GLBX-20250227-P8LQFHG7JM',
        path: 'data/parsed/GLBX-20250227-P8LQFHG7JM'
      },
      {
        id: 'GLBX-20250226-X7KPFGT5LM',
        name: 'GLBX-20250226-X7KPFGT5LM',
        path: 'data/parsed/GLBX-20250226-X7KPFGT5LM'
      }
    ];
    setFiles(mockFiles);
  }, []);

  // Handler for file selection
  const handleFileSelect = (fileId) => {
    setLoading(true);
    setError(null);

    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }

    // Load the selected file data
    loadFileData(fileId);
  };

  // Function to load data from a selected file
  const loadFileData = async (fileId) => {
    try {
      // In a real implementation, this would call loadCSVFile from utils/fileHandlers
      // For now, use mock data
      setTimeout(() => {
        const mockTimeSeriesData = generateMockTimeSeriesData(fileId);
        const mockPriceDistData = generateMockPriceDistData(fileId);
        const mockVolumeDistData = generateMockVolumeDistData(fileId);
        const mockBidAskData = generateMockBidAskData(fileId);
        const mockSummaryData = generateMockSummaryData(fileId);

        setTimeSeriesData(prev => ({...prev, [fileId]: mockTimeSeriesData}));
        setPriceDistData(prev => ({...prev, [fileId]: mockPriceDistData}));
        setVolumeDistData(prev => ({...prev, [fileId]: mockVolumeDistData}));
        setBidAskData(prev => ({...prev, [fileId]: mockBidAskData}));
        setSummaryData(prev => ({...prev, [fileId]: mockSummaryData}));
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(`Error loading file data: ${err.message}`);
      setLoading(false);
    }
  };

  // Generate mock time series data
  const generateMockTimeSeriesData = (fileId) => {
    const isFirstFile = fileId === 'GLBX-20250227-P8LQFHG7JM';
    const basePrice = isFirstFile ? 100 : 98;
    const volatility = isFirstFile ? 0.5 : 0.7;

    return Array.from({ length: 100 }, (_, i) => ({
      seconds_from_start: i * 0.5,
      price: basePrice + Math.sin(i * 0.1) * volatility + Math.random() * volatility,
      size: Math.floor(Math.random() * 100) + 10,
      side_desc: Math.random() > 0.5 ? 'Ask' : 'Bid'
    }));
  };

  // Generate mock price distribution data
  const generateMockPriceDistData = (fileId) => {
    const isFirstFile = fileId === 'GLBX-20250227-P8LQFHG7JM';
    const basePrice = isFirstFile ? 100 : 98;
    const priceRange = Array.from({ length: 20 }, (_, i) => basePrice - 2.5 + i * 0.25);

    return priceRange.map(price => ({
      price_bin: price,
      'Ask': Math.floor(Math.random() * 50) + 10,
      'Bid': Math.floor(Math.random() * 50) + 10
    }));
  };

  // Generate mock volume distribution data
  const generateMockVolumeDistData = (fileId) => {
    const volumes = [10, 20, 50, 100, 200, 500];

    return volumes.map(size => ({
      size,
      'Ask': Math.floor(Math.random() * 100) + 20,
      'Bid': Math.floor(Math.random() * 100) + 20
    }));
  };

  // Generate mock bid-ask spread data
  const generateMockBidAskData = (fileId) => {
    const isFirstFile = fileId === 'GLBX-20250227-P8LQFHG7JM';
    const basePrice = isFirstFile ? 100 : 98;

    return Array.from({ length: 50 }, (_, i) => {
      const time = i * 1.0;
      const spread = 0.05 + Math.random() * 0.2;
      return {
        seconds_from_start: time,
        min_ask: basePrice + spread / 2 + Math.random() * 0.1,
        max_bid: basePrice - spread / 2 - Math.random() * 0.1,
        spread
      };
    });
  };

  // Generate mock summary statistics
  const generateMockSummaryData = (fileId) => {
    const isFirstFile = fileId === 'GLBX-20250227-P8LQFHG7JM';
    return {
      total_records: isFirstFile ? 15425 : 12983,
      unique_symbols: 1,
      unique_symbol_list: isFirstFile ? 'ES-2025H' : 'ES-2025M',
      ask_count: isFirstFile ? 7854 : 6492,
      bid_count: isFirstFile ? 7571 : 6491,
      min_price: isFirstFile ? 97.25 : 96.50,
      max_price: isFirstFile ? 102.75 : 99.75,
      avg_price: isFirstFile ? 100.12 : 98.14,
      price_std_dev: isFirstFile ? 0.87 : 0.65,
      min_size: 1,
      max_size: isFirstFile ? 520 : 480,
      avg_size: isFirstFile ? 45.7 : 42.3,
      start_time: isFirstFile ? '2025-02-27T08:30:00.000000000' : '2025-02-26T08:30:00.000000000',
      end_time: isFirstFile ? '2025-02-27T15:15:00.000000000' : '2025-02-26T15:15:00.000000000'
    };
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