import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  initialize, 
  requestPermission, 
  readRecords, 
  getGrantedPermissions 
} from 'react-native-health-connect';
import { supabase } from '../lib/initSupabase'; // Import Supabase
import { AuthContext } from './AuthProvider';

const HealthConnectContext = createContext();

export const HealthConnectProvider = ({ children }) => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); 
  const { session } = useContext(AuthContext);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const readHealthData = async (startDate) => {
    if (Platform.OS !== 'android') {
      return { totalSteps: 0, totalDistance: 0 };
    }

    try {
      // Initialize the client
      const isInitialized = await initialize();
      if (!isInitialized) {
        throw new Error('Health Connect initialization failed');
      }

      // Check if permissions have been granted using getGrantedPermissions
      const grantedPermissionsResponse = await getGrantedPermissions();
            
      // Extract granted permissions
      const grantedPermissions = new Set(grantedPermissionsResponse.map(permission => `${permission.accessType}_${permission.recordType}`));

      const requiredPermissions = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'FloorsClimbed' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' }
      ];

      // Check if all required permissions are granted
      const allPermissionsGranted = requiredPermissions.every(
        perm => grantedPermissions.has(`${perm.accessType}_${perm.recordType}`)
      );

      if (!allPermissionsGranted) {
        // Request permissions for missing ones
        await requestPermission(requiredPermissions);

        // Permissions are now granted
        setPermissionsGranted(true);
      } else {
        // Permissions were already granted
        setPermissionsGranted(true);
      }

    // if (Platform.OS !== 'android') {
    //   return { totalSteps: 0, totalDistance: 0 };
    // }

    // try {
    //   // Initialize the client
    //   const isInitialized = await initialize();
    //   if (!isInitialized) {
    //     throw new Error('Health Connect initialization failed');
    //   }

    //   // Request permissions
    //   await requestPermission([
    //     { accessType: 'read', recordType: 'Steps' },
    //     { accessType: 'read', recordType: 'Distance' },
    //     { accessType: 'read', recordType: 'FloorsClimbed' },
    //     { accessType: 'read', recordType: 'ActiveCaloriesBurned' }
    //   ]);

      // Ensure startDate is a valid ISO string
      const startDateString = new Date(startDate).toISOString();

      const timeRangeFilter = {
        operator: 'after',
        startTime: startDateString,
      };

      // Fetch and calculate steps
      const stepsRecords = await readRecords('Steps', { timeRangeFilter });
      const totalSteps = stepsRecords.reduce((sum, cur) => sum + cur.count, 0);
     

      // Fetch and calculate distance
      const distanceRecords = await readRecords('Distance', { timeRangeFilter });
      const totalDistanceFlat = distanceRecords.reduce((sum, cur) => sum + cur.distance.inKilometers, 0);
      const totalDistance = Math.round(totalDistanceFlat * 10) / 10;

      return { totalSteps, totalDistance };
    } catch (error) {
      console.error('Error reading health data:', error);
      return { totalSteps: 0, totalDistance: 0 };
    }
  };

  const updateUserDataToSupabase = async () => {

    const user = session?.user;
    if (!user) {

      return;
    }

    try {
      // Fetch user profile to get the account creation date
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at, total_steps, total_distance_km')
        .eq('id', user?.id)
        .single();

      if (error || !data) {
        throw new Error('Error fetching user profile from Supabase:', error);
      }

      const createdAt = new Date(data.created_at);
      createdAt.setHours(0, 0, 0, 0); // Set time to midnight
      const creationTimeISO = createdAt.toISOString();

      const { totalSteps: currentSteps, totalDistance: currentDistance } = await readHealthData(creationTimeISO);
      

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
          .eq('id', user?.id);

        if (updateError) {
          throw new Error('Error updating Supabase:', updateError);
        } else {
          console.log('Supabase updated successfully');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    const fetchPermissionsAndData = async () => {
      try {
        // Fetch current granted permissions
        const grantedPermissionsResponse = await getGrantedPermissions();
        const grantedPermissions = new Set(grantedPermissionsResponse.map(permission => `${permission.accessType}_${permission.recordType}`));

        console.log('grantedPermissions', grantedPermissions);
        const requiredPermissions = [
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'FloorsClimbed' },
          { accessType: 'read', recordType: 'ActiveCaloriesBurned' }
        ];

        // Check if all required permissions are granted
        const allPermissionsGranted = requiredPermissions.every(
          perm => grantedPermissions.has(`${perm.accessType}_${perm.recordType}`)
        );

        if (!allPermissionsGranted) {
          // Permissions are not yet granted, request them
          await requestPermission(requiredPermissions);

          // Permissions are now granted
          setPermissionsGranted(true);
        } else {
          // Permissions were already granted
          setPermissionsGranted(true);
        }

        // If permissions are granted, fetch health data
        if (permissionsGranted) {
          const startDateString = new Date().toISOString(); // Adjust as needed
          const { totalSteps, totalDistance } = await readHealthData(startDateString);
          setSteps(totalSteps);
          setDistance(totalDistance);
        }
      } catch (error) {
        console.error('Error fetching or requesting permissions:', error);
      }
    };

    if (session) {
      fetchPermissionsAndData();
    }
  }, [session]); // Execute on session change

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateUserDataToSupabase();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [session, permissionsGranted]);

  return (
    <HealthConnectContext.Provider value={{ steps, distance, readHealthData }}>
      {children}
    </HealthConnectContext.Provider>
  );
};

export const useHealthConnect = () => useContext(HealthConnectContext);
