import Papa from 'papaparse';

// Function to fetch real files
export const fetchRealFiles = async () => {
  const endPoint = 'http://127.0.0.1:5000/get_files';
  const response = await fetch(endPoint); // Adjust the path if necessary
  if (!response.ok) {
    throw new Error(`Error fetching real files: ${response.statusText}`);
  }
  return await response.json(); // Return the fetched file data
};

export const loadCSVFile = async (fileName) => {
  try {
    const endPoint = 'http://127.0.0.1:5000/get_data';
    const response = await fetch(endPoint, {
      method: 'POST', // Specify the request method
      headers: {
        'Content-Type': 'application/json', // Indicate the content type
      },
      body: JSON.stringify({ fileName }) // Send the fileName in the request body
    });

    if (!response.ok) {
      throw new Error(`Error loading CSV file: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the parsed response data
  } catch (error) {
    console.error('Error loading CSV file:', error);
    throw error;
  }
};
