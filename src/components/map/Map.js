import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox, { ShapeSource, FillLayer, LineLayer } from '@rnmapbox/maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../../lib/initSupabase.js';
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../../consts/Colors.js';
import { AuthContext } from '../../provider/AuthProvider';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY);
const h3 = require("h3-reactnative");

const Map = ({ onHexagonCaptured }) => {
  const [location, setLocation] = useState(null);
  const [hexagons, setHexagons] = useState(null);
  const [lineWidth, setLineWidth] = useState(3);
  const { session } = useContext(AuthContext);
  
  const userId = session?.user.id;
  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      requestLocationPermission().then(() => {
        fetchLocations(); 
      });
    }, [userId, ])
  );

  useEffect(() => {
    if (location) {
      updateHexagons(location);
    }
  }, [location]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    //  const currentLocation = await Location.getCurrentPositionAsync({});
    const currentLocation = { coords: { latitude: 50.749999, longitude: 3.733333 } };
    setLocation(currentLocation.coords);

    console.log('Current location:', currentLocation.coords);
  };

  const fetchLocations = async () => {
    try {
      let { data: locationsData, error } = await supabase
        .from('locations')
        .select('hex_index')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (locationsData) {
        updateMapWithLocations(locationsData);
      }
    } catch (error) {
      console.error('Error fetching locations:', error.message);
    }
  };

  const checkAndAddHexIndex = async (hexIndex) => {
    try {
      let { data: hexData, error: hexError } = await supabase
        .from('locations')
        .select('hex_index')
        .eq('hex_index', hexIndex);

      if (hexError) {
        console.error('Error checking hex index:', hexError);
        return;
      }

      if (!hexData.length) {
        const { data, error: insertError } = await supabase
          .from('locations')
          .insert([{ hex_index: hexIndex, user_id: userId }]);

        if (insertError) {
          console.error('Error inserting hex index:', insertError);
        } else {
          console.log('Hex index added:', hexIndex);
          onHexagonCaptured(); 
          fetchLocations(); 
        }
      } else {
        console.log('Hex index already exists in the database.');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const updateHexagons = (loc) => {
    console.log(loc.latitude, loc.longitude);
    const centerIndex = h3.geoToH3(loc.latitude, loc.longitude, 9);
    checkAndAddHexIndex(centerIndex);
  
    const hexIndices = h3.kRing(centerIndex, 0);
    const hexagons = hexIndices.map(index => h3.h3ToGeoBoundary(index, true));
    const hexGeoJson = {
      type: 'FeatureCollection',
      features: hexagons.map(hex => ({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [hex]
        }
      }))
    };
    setHexagons(hexGeoJson);
  };

  const updateMapWithLocations = (locationsData) => {
    const currentLocationHex = location ? h3.geoToH3(location.latitude, location.longitude, 9) : null;
    const features = locationsData.map(location => {
      const boundary = h3.h3ToGeoBoundary(location.hex_index, true);
      return {
        type: 'Feature',
        properties: {
          description: location.description || "No description",
        },
        geometry: {
          type: 'Polygon',
          coordinates: [boundary]
        }
      };
    });
    
    if (currentLocationHex) {
      const currentBoundary = h3.h3ToGeoBoundary(currentLocationHex, true);
      features.push({
        type: 'Feature',
        properties: {
          description: "Current Location",
        },
        geometry: {
          type: 'Polygon',
          coordinates: [currentBoundary]
        }
      });
    }
  
    const hexGeoJson = {
      type: 'FeatureCollection',
      features: features
    };
  
    setHexagons(hexGeoJson);
  };

  const centerMapOnUser = () => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 14.5,
        animationDuration: 1000,
      });
    }
  };

  const handleRegionDidChange = async () => {
    if (mapRef.current) {
      const zoomLevel = await mapRef.current.getZoom();
      if (zoomLevel < 14) {
        setLineWidth(1);
      } else {
        setLineWidth(3);
      }
    }
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.black }}>Loading map...</Text>
      </View>
    );
  }

  const customMapStyle = 'mapbox://styles/woutertack/clw88shyw002i01r06xjcgpwn';

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} styleURL={customMapStyle} ref={mapRef} onMapIdle={handleRegionDidChange}> 
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14.5}
          centerCoordinate={[location.longitude, location.latitude]}
          animationMode="flyTo"
          animationDuration={2000}
          maxZoomLevel={16}
          
        />

        {hexagons && (
          <ShapeSource id="hexagons" shape={hexagons}>
            <FillLayer id="hexagonFill" style={ {
              fillColor: Colors.primaryGreen,
              fillOutlineColor: Colors.secondaryGreen,
              fillOpacity: 0.25,
            }} />
            <LineLayer id="hexagonLine"  style={{
              lineColor: Colors.secondaryGreen,
              lineWidth: lineWidth,
            }} />
          </ShapeSource>
        )}

         <Mapbox.PointAnnotation
          id="userLocation"
          coordinate={[location.longitude, location.latitude]}
          title="Your location"
          showsUserHeadingIndicator={false}
          pointerEvents="none"
        >
      
         <View style={{
              height: 30,
              width: 30,
              borderRadius: 50,
              backgroundColor: Colors.secondaryGreen,
              justifyContent: 'center',
              alignItems: 'center',
          }}>
              <View style={{
                  height: 24, // Adjust this value as needed
                  width: 24, // Adjust this value as needed
                  borderRadius: 50,
                  backgroundColor: Colors.secondaryGreen,
                  borderColor: '#fff',
                  borderWidth: 3
              }} />
          </View>
        </Mapbox.PointAnnotation> 
      </Mapbox.MapView>
      <TouchableOpacity style={styles.buttonContainer} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={28}  style={styles.navIcon}  />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
   customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue', // Change this to your desired color
    borderWidth: 2,
    borderColor: 'white',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  map: {
    width: '100%',
    height: '120%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 1)",
    padding: 12,
    borderRadius: 30,
    borderColor: Colors.secondaryGreen,
    borderWidth: 2.5,
    shadowColor: "#000",
    shadowOffset: {
        width: 2,
        height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // for Android
  },
  navIcon: {
    color: Colors.secondaryGreen,
  },
  fogOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
});

export default Map;