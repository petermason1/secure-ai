// Mock validation data for MVP testing
// This will be replaced with real API data later

export type ValidationData = {
  searchVolume?: number;
  sparkline?: number[];
  label?: string;
  chartUrl?: string;
};

export const validationMockData: Record<string, ValidationData> = {
  // Example idea codes - replace with actual seed codes from your generated ideas
  BQAXZURG7Y: {
    searchVolume: 2300,
    sparkline: [100, 120, 130, 140, 200, 230, 250, 300, 320, 400, 450, 500],
    label: 'Trending Up',
  },
  AB12XYZ456: {
    searchVolume: 25,
    sparkline: [60, 55, 50, 45, 42, 38, 31, 29, 28, 24, 20, 25],
    label: 'Low Demand',
  },
  // Additional mock entries for testing different validation states
  HIGHVOLUME1: {
    searchVolume: 12500,
    sparkline: [8000, 8500, 9000, 9500, 10000, 10500, 11000, 11500, 12000, 12200, 12300, 12500],
    label: 'High Interest',
  },
  MEDIUMVOL1: {
    searchVolume: 850,
    sparkline: [600, 650, 700, 720, 750, 780, 800, 820, 830, 840, 845, 850],
    label: 'Moderate Interest',
  },
  TRENDINGDN1: {
    searchVolume: 450,
    sparkline: [1200, 1100, 950, 800, 700, 600, 550, 500, 480, 470, 460, 450],
    label: 'Declining',
  },
  STABLEVOL1: {
    searchVolume: 1800,
    sparkline: [1750, 1780, 1790, 1800, 1795, 1805, 1800, 1802, 1798, 1801, 1799, 1800],
    label: 'Stable',
  },
  RAPIDGROW1: {
    searchVolume: 5600,
    sparkline: [200, 300, 450, 650, 900, 1200, 1800, 2500, 3500, 4500, 5200, 5600],
    label: 'Rapid Growth',
  },
  NICHELOW1: {
    searchVolume: 45,
    sparkline: [30, 32, 35, 38, 40, 42, 43, 44, 45, 44, 45, 45],
    label: 'Niche Market',
  },
  // Real generated idea codes
  C8P94FHESR: {
    searchVolume: 3200,
    sparkline: [1500, 1800, 2100, 2400, 2700, 2900, 3000, 3100, 3150, 3180, 3190, 3200],
    label: 'Growing Interest',
  },
  // Add more entries as you generate ideas
  // Format: SEED_CODE: { searchVolume, sparkline, label }
};

