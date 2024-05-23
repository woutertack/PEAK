import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { 
  initialize, 
  requestPermission, 
  readRecords 
} from 'react-native-health-connect';

// Create a context for Health Connect data
const HealthConnectContext = createContext();

export const HealthConnectProvider = ({ children }) => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [floorsClimbed, setFloorsClimbed] = useState(0);

  const readData = async (startDate, endDate) => {
    if (Platform.OS !== 'android') {
      return;
    }

    // Initialize the client
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }

    // Request permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'Distance' },
      { accessType: 'read', recordType: 'FloorsClimbed' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' }
    ]);

    const timeRangeFilter = {
      operator: 'between',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString()
    };

    // Fetch and calculate steps
    const stepsRecords = await readRecords('Steps', { timeRangeFilter });
    const totalSteps = stepsRecords.reduce((sum, cur) => sum + cur.count, 0);
    setSteps(totalSteps);

    // Fetch and calculate distance
    const distanceRecords = await readRecords('Distance', { timeRangeFilter });
    const totalDistance = distanceRecords.reduce((sum, cur) => sum + cur.distance.inMeters, 0);
    setDistance(totalDistance);

    // Fetch and calculate floors climbed
    const floorsClimbedRecords = await readRecords('FloorsClimbed', { timeRangeFilter });
    const totalFloorsClimbed = floorsClimbedRecords.reduce((sum, cur) => sum + cur.floors, 0);
    setFloorsClimbed(totalFloorsClimbed);
  };

  return (
    <HealthConnectContext.Provider value={{ steps, distance, floorsClimbed, readData }}>
      {children}
    </HealthConnectContext.Provider>
  );
};

export const useHealthConnect = () => useContext(HealthConnectContext);
