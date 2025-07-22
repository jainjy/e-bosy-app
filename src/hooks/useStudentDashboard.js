import { useEffect, useState } from 'react';
import { getData } from '../services/ApiFetch';

export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [data, err] = await getData('admindashboard');
        if (err) {
          throw new Error(err.message || 'Failed to fetch dashboard data');
        }
        setDashboardData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { dashboardData, loading, error };
};