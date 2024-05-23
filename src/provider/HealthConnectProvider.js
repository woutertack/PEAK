import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  initialize, 
  requestPermission, 
  readRecords 
} from 'react-native-health-connect';
import { supabase } from '../lib/initSupabase'; // Import Supabase
import { AuthContext } from './AuthProvider';

const HealthConnectContext = createContext();

export const HealthConnectProvider = ({ children }) => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); 
  const { session } = useContext(AuthContext);

  const readHealthData = async (startDate) => {
    if (Platform.OS !== 'android') {
      return { totalSteps: 0, totalDistance: 0 };
    }

    // Initialize the client
    const isInitialized = await initialize();
    if (!isInitialized) {
      return { totalSteps: 0, totalDistance: 0 };
    }

    // Request permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'FloorsClimbed' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' }
    ]);

    const timeRangeFilter = {
      operator: 'after',
      startTime: startDate.toISOString(),
    };

    // Fetch and calculate steps
    const stepsRecords = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = stepsRecords.reduce((sum, cur) => sum + cur.count, 0);

    // Fetch and calculate distance
    const distanceRecords = await readRecords('Distance', { timeRangeFilter });
    const totalDistanceFlat = distanceRecords.reduce((sum, cur) => sum + cur.distance.inKilometers, 0);
    const totalDistance = Math.round(totalDistanceFlat * 10) / 10;

    return { totalSteps, totalDistance };
  };

  const updateUserDataToSupabase = async () => {
    const user = session?.user;
    if (!user) {
      return;
    }

    // Fetch user profile to get the account creation date
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at, total_steps, total_distance_km')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile from Supabase:', error);
      return;
    }

    const createdAt = new Date(data.created_at);
    const { totalSteps: currentSteps, totalDistance: currentDistance } = await readHealthData(createdAt);

    // Update state with fetched data
    setSteps(currentSteps);
    setDistance(currentDistance);

    // Check if the steps or distance have changed, if so, update Supabase
    const hasStepsChanged = currentSteps !== data.total_steps;
    const hasDistanceChanged = currentDistance !== Math.round(data.total_distance_km * 10) / 10;

    if (hasStepsChanged || hasDistanceChanged) {
      // Update Supabase with the new values
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          total_steps: currentSteps,
          total_distance_km: currentDistance  
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating Supabase:', updateError);
      } else {
        console.log('Supabase updated successfully');
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateUserDataToSupabase();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [session]);

  return (
    <HealthConnectContext.Provider value={{ steps, distance, readHealthData }}>
      {children}
    </HealthConnectContext.Provider>
  );
};

export const useHealthConnect = () => useContext(HealthConnectContext);
