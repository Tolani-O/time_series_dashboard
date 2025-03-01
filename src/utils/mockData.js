// Mock files definition
export const fetchMockFiles = async () => {
  return [
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
};

export const loadMockFile = async (fileId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        const mockTimeSeriesData = generateMockTimeSeriesData(fileId);
        const mockPriceDistData = generateMockPriceDistData(fileId);
        const mockVolumeDistData = generateMockVolumeDistData(fileId);
        const mockBidAskData = generateMockBidAskData(fileId);
        const mockSummaryData = generateMockSummaryData(fileId);

        resolve({
            timeSeriesData: mockTimeSeriesData,
            priceDistData: mockPriceDistData,
            volumeDistData: mockVolumeDistData,
            bidAskData: mockBidAskData,
            summaryData: mockSummaryData,
        });
        }, 1000);
    });
};

// Generate mock time series data
export const generateMockTimeSeriesData = (fileId) => {
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
export const generateMockPriceDistData = (fileId) => {
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
export const generateMockVolumeDistData = (fileId) => {
  const volumes = [10, 20, 50, 100, 200, 500];

  return volumes.map(size => ({
    size,
    'Ask': Math.floor(Math.random() * 100) + 20,
    'Bid': Math.floor(Math.random() * 100) + 20
  }));
};

// Generate mock bid-ask spread data
export const generateMockBidAskData = (fileId) => {
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
export const generateMockSummaryData = (fileId) => {
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