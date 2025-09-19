import { useEffect } from 'react';
import loadAnalytics from '../utils/analytics';

const AnalyticsLoader = () => {
  useEffect(() => {
    loadAnalytics(import.meta.env.VITE_ANALYTICS_ID);
  }, []);

  return null;
};

export default AnalyticsLoader;
