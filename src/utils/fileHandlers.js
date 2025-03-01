import Papa from 'papaparse';

// Function to fetch real files (placeholder)
export const fetchRealFiles = async () => {
  // Implement the logic to fetch real files from your data source
  return [
    {
      id: 'REAL-FILE-1',
      name: 'Real File 1',
      path: 'data/real/real-file-1'
    },
    {
      id: 'REAL-FILE-2',
      name: 'Real File 2',
      path: 'data/real/real-file-2'
    }
  ];
};

export const loadCSVFile = async (filePath) => {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();

    // Parse CSV
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
};
