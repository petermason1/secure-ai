// Hook for fetching validation data
// Currently returns mock data, but can be swapped to API fetch later

import { validationMockData } from '../data/validationMockData';
import type { ValidationData } from '../data/validationMockData';

export function useValidationData(): Record<string, ValidationData> {
  // For MVP, just return mock data
  // Later, swap to API-based fetch:
  // const [data, setData] = useState<Record<string, ValidationData>>({});
  // useEffect(() => { fetch('/api/validation').then(...) }, []);
  // return data;
  return validationMockData;
}

