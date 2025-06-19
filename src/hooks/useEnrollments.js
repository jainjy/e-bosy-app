import { useState, useEffect } from 'react';
import { getData } from '../services/ApiFetch';
import { useAuth } from '../services/AuthContext';

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const [data, error] = await getData(`enrollments`);
        if (error) throw error;

        const userEnrollments = data.filter(
          enrollment => enrollment.userId === user.userId
        );
        setEnrollments(userEnrollments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.userId]);

  return {
    enrollments,
    loading,
    error,
    isEnrolled: (courseId) => enrollments.some(e => e.courseId === courseId)
  };
};