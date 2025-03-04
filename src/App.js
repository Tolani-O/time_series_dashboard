import React, { useState, useEffect } from 'react';
import FileSelector from './components/FileSelector';
import TimeRangeSlider from './components/TimeRangeSlider';
import TimeSeriesChart from './components/TimeSeriesChart';
import PriceDistributionChart from './components/PriceDistributionChart';
import VolumeDistributionChart from './components/VolumeDistributionChart';
import SummaryStatistics from './components/SummaryStatistics';
import { binarySearchLowerBound, binarySearchUpperBound } from './utils/helper_functions'; // Importing the new search functions
import { loadFileData, getFiles } from './utils/dataLoader'; // Importing the new loadFileData function
import './App.css'; // Import the stylesheet

// Define step as a global variable
const step = 10; // Every 10 seconds, adjust based on your data granularity

function App() {
  // State management
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState({});
  const [timeIndices, setTimeIndices] = useState({});
  const [priceDistData, setPriceDistData] = useState({});
  const [volumeDistData, setVolumeDistData] = useState({});
  const [bidAskData, setBidAskData] = useState({});
  const [summaryData, setSummaryData] = useState({});
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadMockFiles] = useState(false); // New state to determine file loading type
  const [isCacheCleared, setIsCacheCleared] = useState(false); // New state for tracking cache status

  // Find available data files and set up time indices
  useEffect(() => {
    // Fetch files first
    fetchFiles()
        .then(() => console.log('Files loaded successfully'))
        .catch(error => {
          console.error('Error loading files:', error);
          setError('Failed to load available data files');
      });
  }, []);


  const fetchFiles = async () => {
      const filesList = await getFiles(loadMockFiles); // Use getFiles to fetch files
      setFiles(filesList);
    };


  // Function to handle clearing the cache
  const handleClearCache = () => {
    // Clear all data states
    setTimeSeriesData({});
    setTimeIndices({});
    setPriceDistData({});
    setVolumeDistData({});
    setBidAskData({});
    setSummaryData({});

    // Also clear selected files since their data is now gone
    setSelectedFiles([]);

    // Set cache cleared status for feedback
    setIsCacheCleared(true);

    // Reset the cache cleared status after 3 seconds
    setTimeout(() => {
      setIsCacheCleared(false);
    }, 3000);

    console.log('Cache cleared successfully');
  };


  // This would run once when loading data
  const createTimeIndex = (data) => {
    if (!data || !Array.isArray(data)) return {};

    const index = {};

    data.forEach((point, i) => {
      if (point && typeof point.seconds_from_start === 'number') {
        const bucket = Math.floor(point.seconds_from_start / step) * step;
        if (!index[bucket]) index[bucket] = [];
        index[bucket].push(i);
      }
    });

    return index;
  };

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

      // Check if we already have the data for this file
      if (timeSeriesData[fileId]) {
        console.log(`Using cached data for file ${fileId}`);
        setLoading(false);
        return; // Exit early since we already have the data
      }

      // Load the selected file data
      try {
        const data = await loadFileData(fileId, loadMockFiles); // Pass true for mock data, or false for CSV data
        setTimeSeriesData(prev => ({...prev, [fileId]: data.timeSeriesData}));
        setTimeIndices(prev => ({ ...prev, [fileId]: createTimeIndex(data.timeSeriesData)}));
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

  // Function to filter time series data based on time range
  const getFilteredTimeSeriesData = (fileId) => {
    const data = timeSeriesData[fileId];
    const index = timeIndices[fileId];
    if (!data || !index) return [];

    const min = timeRange[0];
    const max = timeRange[1];

    // Calculate bucket boundaries
    const startBucket = Math.floor(min / step) * step;
    const endBucket = Math.floor(max / step) * step;
    const bucketKeys = Object.keys(index).map(Number);

    // Find relevant buckets with binary search
    const startPos = binarySearchUpperBound(bucketKeys, startBucket);
    if (startPos === -1) return []; // No buckets match our criteria
    const endPos = binarySearchLowerBound(bucketKeys, endBucket);

    // For the first and last buckets, we may need to filter
    let allIndices = [];

    // Process all buckets
    for (let i = startPos; i <= endPos; i++) {
      const bucketIndices = index[bucketKeys[i]];

      if (i === startPos) {
        // For the first bucket, we need to filter out points before min
        // Find the first index within the bucket that meets our criteria
        const firstValidIndex = binarySearchLowerBound(bucketIndices, min);
        if (firstValidIndex !== -1) {
          // Since the indices within the bucket are sorted, all indices after firstValidIndex are also valid
          allIndices = allIndices.concat(bucketIndices.slice(firstValidIndex));
        }
        else {
          allIndices = allIndices.concat(bucketIndices);
        }
      } else if (i === endPos) {
        // For the last bucket, filter out points after max
        // Find the last index within the bucket that meets our criteria
        const lastValidIndex = binarySearchUpperBound(bucketIndices, max);
        if (lastValidIndex !== -1) {
          // All indices up to and including lastValidIndex are valid
          allIndices = allIndices.concat(bucketIndices.slice(0, lastValidIndex + 1));
        }
        else {
          allIndices = allIndices.concat(bucketIndices);
        }
      } else {
        // For middle buckets, all points are guaranteed to be in range
        allIndices = allIndices.concat(bucketIndices);
      }
    }

    // Map indices to data points - no further filtering needed
    return allIndices.map(i => data[i]);
  };


  return (
    <div className="min-h-screen p-4 transition duration-300 ease-in-out">
      {/* Updated Header with Styled Classes */}
      <header className="app-header">
        <h1>Futures Tick Data Visualization</h1>
        <p>Interactive visualization of futures contract tick data with nanosecond precision</p>
      </header>

      <div className="grid-container">
        {/* Updated Sidebar/Controls with Card Styling */}
        <div className="grid-item">
          <div className="card">
            <h2 className="card-title">Controls</h2>

            {/* File Selector Component */}
            <div className="control-section">
              <FileSelector
                files={files}
                selectedFiles={selectedFiles}
                onSelectFile={handleFileSelect}
                loading={loading}
              />
            </div>

            {/* Time Range Slider Component */}
            <div className="control-section">
              <TimeRangeSlider
                timeRange={timeRange}
                onChange={handleTimeRangeChange}
              />
            </div>

            {/* Clear Cache Button */}
            <div className="control-section">
              <button
                onClick={handleClearCache}
                className="btn btn-danger btn-block"
              >
                Clear Data Cache
              </button>

              {/* Cache cleared confirmation message */}
              {isCacheCleared && (
                <div className="status-message status-success">
                  Cache cleared successfully!
                </div>
              )}
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="status-message status-loading">
                Loading data...
              </div>
            )}
            {error && (
              <div className="status-message status-error">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid-item">
          {/* Time Series Analysis */}
          <div className="card">
            <div className="card-title-with-actions">
              <h2 className="card-title">Time Series Analysis</h2>
              <div className="text-sm text-gray-500">
                Showing data from {timeRange[0]}s to {timeRange[1]}s
              </div>
            </div>
            <div className="chart-container">
              <TimeSeriesChart
                selectedFiles={selectedFiles}
                getFilteredData={getFilteredTimeSeriesData}
              />
            </div>
          </div>

          {/* Price and Volume Distribution Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="card-title">Price Distribution</h2>
              <div className="chart-container">
                <PriceDistributionChart
                  selectedFiles={selectedFiles}
                  priceDistData={priceDistData}
                />
              </div>
            </div>
            <div className="card">
              <h2 className="card-title">Volume Distribution</h2>
              <div className="chart-container">
                <VolumeDistributionChart
                  selectedFiles={selectedFiles}
                  volumeDistData={volumeDistData}
                />
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="card">
            <h2 className="card-title">Summary Statistics</h2>
            <SummaryStatistics
              selectedFiles={selectedFiles}
              summaryData={summaryData}
            />
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>Futures Contract Tick Data Visualization Tool</p>
      </footer>
    </div>
  );
}

export default App;
