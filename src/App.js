import React, {useCallback, useEffect, useReducer, useState} from 'react';
import FileSelector from './components/FileSelector';
import TimeRangeSlider from './components/TimeRangeSlider';
import TimeSeriesChart from './components/TimeSeriesChart';
import PriceDistributionChart from './components/PriceDistributionChart';
import VolumeDistributionChart from './components/VolumeDistributionChart';
import SummaryStatistics from './components/SummaryStatistics';
import {binarySearchLowerBound, binarySearchUpperBound} from './utils/helper_functions';
import {getFiles, loadFileData} from './utils/dataLoader';
import {appReducer} from "./utils/appReducer";
import './App.css';

// Define step as a global variable
const step = 10; // Every 10 seconds

// Define initial state
const initialState = {
  files: [],
  selectedFiles: [],
  appData: {
    timeSeriesData: {},
    timeIndices: {},
    priceDistData: {},
    volumeDistData: {},
    summaryData: {}
  },
  timeRange: [0, 100],
  maxTimeValue: 1000,
  loading: {
    filesLoading: false,
    dataLoading: false
  },
  error: null,
  isCacheCleared: false
};

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loadMockFiles] = useState(false);

  const {
    files,
    selectedFiles,
    appData: { timeSeriesData, timeIndices, priceDistData, volumeDistData, summaryData },
    timeRange,
    maxTimeValue,
    loading,
    error,
    isCacheCleared
  } = state;

  // Find available data files
  useEffect(() => {
    const fetchFiles = async () => {
      dispatch({ type: 'SET_LOADING', payload: { filesLoading: true } });
      try {
        const filesList = await getFiles(loadMockFiles);
        dispatch({ type: 'SET_FILES', payload: filesList });
      } catch (error) {
        console.error('Error loading files:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load available data files'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { filesLoading: false } });
      }
    };

    fetchFiles().then(() => console.log('Files loaded successfully'));
  }, [loadMockFiles]);

  // Create time index function
  const createTimeIndex = useCallback((data) => {
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
  }, []);

  // Handler for file selection
  const handleFileSelect = useCallback(async (fileId) => {
    // Start loading state
    dispatch({ type: 'SET_LOADING', payload: { dataLoading: true } });
    dispatch({ type: 'SET_ERROR', payload: null });

    if (selectedFiles.includes(fileId)) {
      // Deselecting the file
      dispatch({
        type: 'SET_SELECTED_FILES',
        payload: selectedFiles.filter(id => id !== fileId)
      });
      dispatch({ type: 'SET_LOADING', payload: { dataLoading: false } });
    } else {
      // Selecting the file - first update selected files
      dispatch({
        type: 'SET_SELECTED_FILES',
        payload: [...selectedFiles, fileId]
      });

      // Check if we already have the data for this file
      if (timeSeriesData[fileId]) {
        console.log(`Using cached data for file ${fileId}`);
        dispatch({ type: 'SET_LOADING', payload: { dataLoading: false } });
        return; // Exit early since we already have the data
      }

      // Load the selected file data
      try {
        const data = await loadFileData(fileId, loadMockFiles);

        // Create a batch of updates to dispatch at once
        const updates = [];

        // Calculate max time value from the loaded data
        if (data.timeSeriesData && data.timeSeriesData.length > 0) {
          const lastElement = data.timeSeriesData[data.timeSeriesData.length - 1];
          const dataMaxTime = lastElement && typeof lastElement.seconds_from_start === 'number'
            ? lastElement.seconds_from_start
            : 1000;

          // Update max time if this file has a greater max time
          const newMaxTime = Math.max(maxTimeValue, Math.ceil(dataMaxTime));
          dispatch({ type: 'SET_MAX_TIME_VALUE', payload: newMaxTime });

          // If this is the first file being loaded, set the end time range
          if (selectedFiles.length === 0) {
            dispatch({
              type: 'SET_TIME_RANGE',
              payload: [0, Math.min(Math.ceil(dataMaxTime), 1000)]
            });
          }
        }

        // Create time indices for the data
        const indices = createTimeIndex(data.timeSeriesData);

        // Update all data states at once in a batch
        dispatch({
          type: 'UPDATE_TIME_SERIES_DATA',
          fileId,
          data: data.timeSeriesData
        });

        dispatch({
          type: 'UPDATE_TIME_INDICES',
          fileId,
          data: indices
        });

        dispatch({
          type: 'UPDATE_PRICE_DIST_DATA',
          fileId,
          data: data.priceDistData
        });

        dispatch({
          type: 'UPDATE_VOLUME_DIST_DATA',
          fileId,
          data: data.volumeDistData
        });

        dispatch({
          type: 'UPDATE_SUMMARY_DATA',
          fileId,
          data: data.summaryData
        });

      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { dataLoading: false } });
      }
    }
  }, [selectedFiles, timeSeriesData, maxTimeValue, loadMockFiles, createTimeIndex]);

  // Time range change handlers
  const handleTimeRangeChange = useCallback((start, end) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: [start, end] });
  }, []);

  // Function to handle clearing the cache
  const handleClearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' });

    // Reset the cache cleared status after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'SET_CACHE_CLEARED', payload: false });
    }, 3000);

    console.log('Cache cleared successfully');
  }, []);

  // Function to filter time series data based on time range - memoize this to prevent recreating on every render
  const getFilteredTimeSeriesData = useCallback((fileId) => {
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
  }, [timeRange, timeIndices, timeSeriesData]);

  // Use React's memo for expensive calculations

  return (
    <div className="min-h-screen p-4 transition duration-300 ease-in-out">
      {/* Header */}
      <header className="app-header">
        <h1>Futures Tick Data Visualization</h1>
        <p>Interactive visualization of futures contract tick data with nanosecond precision</p>
      </header>

      <div className="grid-container">
        {/* Controls */}
        <div className="grid-item">
          <div className="card">
            <h2 className="card-title">Controls</h2>

            {/* File Selector Component */}
            <div className="control-section">
              <FileSelector
                files={files}
                selectedFiles={selectedFiles}
                onSelectFile={handleFileSelect}
                loading={loading.filesLoading || loading.dataLoading}
              />
            </div>

            {/* Time Range Slider Component */}
            <div className="control-section">
              <TimeRangeSlider
                timeRange={timeRange}
                onChange={handleTimeRangeChange}
                maxTimeValue={maxTimeValue}
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
            {(loading.filesLoading || loading.dataLoading) && (
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
