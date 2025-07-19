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
          setError(err);
        } else {
          setDashboardData({
            ...data,
            revenueTrend: {
              months: Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 11 + i);
                return date.toLocaleString('fr-FR', { month: 'short' });
              }),
              amounts: data.revenueTrend || Array(12).fill(0)
            }
          });
        }
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