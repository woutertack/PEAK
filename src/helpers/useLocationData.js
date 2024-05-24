import { useState, useEffect } from 'react';
import { supabase } from '../lib/initSupabase';

const useLocationData = (userId, startDate) => {
  const [hexagons, setHexagons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHexagonData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('locations')
        .select('visited_at')
        .eq('user_id', userId)
        .gte('visited_at', startDate)
     

      if (error) {
        setError(error.message);
      } else {
        setHexagons(data);
      }
      setLoading(false);
    };

    fetchHexagonData();
  }, [userId, startDate]);

  return { hexagons, loading, error };
};

export default useLocationData;
