// Optimized function to create histogram data for large datasets
const createHistogramsData = (filteredData, dataKeys, numBins, maxBins = 10, maxSampleSize = 100000) => {
  if (!filteredData || filteredData.length === 0 || dataKeys.length === 0) return {};

  // Determine if we need downsampling for very large datasets
  const totalPoints = filteredData.length;
  const needsDownsampling = totalPoints > maxSampleSize;

  // Calculate sampling rate if needed (only process every Nth point)
  const samplingRate = needsDownsampling ? Math.ceil((totalPoints * numBins) / (maxSampleSize * maxBins)) : 1;

  // Initialize result object
  const histograms = {};

  // Process each data key separately
  for (const dataKey of dataKeys) {
    // First pass: find min and max (always use full dataset for accurate range)
    let minValue = Infinity;
    let maxValue = -Infinity;
    let validCount = 0;

    // Use traditional for loop instead of forEach for better performance
    for (let i = 0; i < filteredData.length; i++) {
      const val = filteredData[i][dataKey];
      if (val !== undefined && val !== null && !isNaN(val)) {
        minValue = val < minValue ? val : minValue;
        maxValue = val > maxValue ? val : maxValue;
        validCount++;
      }
    }

    // Skip if no valid values
    if (validCount === 0) {
      histograms[dataKey] = [];
      continue;
    }

    // Handle single value case
    if (minValue === maxValue) {
      histograms[dataKey] = [{
        binStart: minValue,
        binEnd: minValue,
        count: validCount,
        binLabel: minValue.toFixed(2)
      }];
      continue;
    }

    // Setup bins - calculate parameters only once
    const range = maxValue - minValue;
    const binWidth = (range / numBins) + 0.000001; // Add small epsilon for numerical stability
    const binWidthInv = numBins / (range + 0.000001); // Precalculate inverse for faster multiplication

    // Pre-allocate bin array and initialize - more efficient than pushing
    const bins = new Array(numBins);
    for (let i = 0; i < numBins; i++) {
      const binStart = minValue + i * binWidth;
      bins[i] = {
        binStart,
        binEnd: minValue + (i + 1) * binWidth,
        count: 0,
        binLabel: binStart.toFixed(2)
      };
    }

    // Second pass: count values into bins (using sampling if needed)
    // This avoids storing all values in memory
    for (let i = 0; i < totalPoints; i += samplingRate) {
      const val = filteredData[i][dataKey];
      if (val !== undefined && val !== null && !isNaN(val)) {
        // Handle edge case for maximum value
        if (val === maxValue) {
          bins[numBins - 1].count += samplingRate;
          continue;
        }

        // Calculate bin index directly with multiplication (faster than division)
        const binIndex = Math.min(Math.floor((val - minValue) * binWidthInv), numBins - 1);
        if (binIndex >= 0) { // No need to check upper bound due to Math.min above
          bins[binIndex].count += samplingRate;
        }
      }
    }

    histograms[dataKey] = bins;
  }

  return histograms;
};

export default createHistogramsData;