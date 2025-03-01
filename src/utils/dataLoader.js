import { fetchMockFiles, loadMockFile } from './mockData';
import {fetchRealFiles, loadCSVFile} from './fileHandlers'; // Assuming this is the correct import for loading CSV files

// Function to get files based on whether to load mock or real files
export const getFiles = (loadMockFiles) => {
  return loadMockFiles ? fetchMockFiles() : fetchRealFiles();
};

export const loadFileData = async (fileId, useMockData = true) => {
  try {
    let loaded_data;
    if (useMockData) {
      // Use mock data
      loaded_data = await loadMockFile(fileId); // Call loadMockFile and return its result
    } else {
      // Load CSV data
      loaded_data = await loadCSVFile(fileId); // Implement this function to load CSV data
    }
    return loaded_data;
  } catch (err) {
    throw new Error(`Error loading file data: ${err.message}`);
  }
}; 