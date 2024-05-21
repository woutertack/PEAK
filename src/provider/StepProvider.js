// contexts/StepContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';

export const StepContext = createContext();

export const StepProvider = ({ children }) => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    (async () => {
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(available);
      if (available) {
        Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
        });
      }
    })();
  }, []);

  return (
    <StepContext.Provider value={{ isPedometerAvailable, stepCount }}>
      {children}
    </StepContext.Provider>
  );
};
