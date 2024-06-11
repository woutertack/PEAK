import React, { useEffect, useRef } from 'react';
import * as Location from 'expo-location';

const LocationHandler = ({ setLocation }) => {
  const locationSubscription = useRef(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      console.log('Initial location:', currentLocation.coords);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 2,
        },
        debounce((currentLocation) => {
          setLocation(currentLocation.coords);
          console.log('Updated location:', currentLocation.coords);
        }, 1000)
      );
    };

    requestLocationPermission();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [setLocation]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  return null;
};

export default LocationHandler;
