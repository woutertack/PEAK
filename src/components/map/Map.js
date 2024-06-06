import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox, { ShapeSource, FillLayer, LineLayer, SymbolLayer } from '@rnmapbox/maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../../lib/initSupabase.js';
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../../consts/Colors.js';
import { AuthContext } from '../../provider/AuthProvider';

Mapbox.setAccessToken("pk.eyJ1Ijoid291dGVydGFjayIsImEiOiJja3A3MWV4NzcwdzVhMnRxdHJmcmJzbWZtIn0.3DtWFcL1fG0pk3JsABoTpA");
const h3 = require("h3-reactnative");

const Map = ({ onHexagonCaptured }) => {
  const [location, setLocation] = useState(null);
  const [hexagons, setHexagons] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [lineWidth, setLineWidth] = useState(2.5);
  const [locationsWithCoordinates, setLocationsWithCoordinates] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(14.5);
  const { session } = useContext(AuthContext);

  const userId = session?.user.id;
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const locationSubscription = useRef(null);

  useFocusEffect(
    useCallback(() => {
      requestLocationPermission().then(() => {
        fetchLocations(); 
      });

      return () => {
        if (locationSubscription.current) {
          locationSubscription.current.remove();
        }
      };
    }, [userId])
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
    
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (currentLocation) => {
        setLocation(currentLocation.coords);
        console.log('Current location:', currentLocation.coords);
      }
    );
  };

  // const requestLocationPermission = async () => {
  //   const { status } = await Location.requestForegroundPermissionsAsync();
  //   if (status !== 'granted') {
  //     console.error('Permission to access location was denied');
  //     return;
  //   }
  //   const currentLocation = await Location.getCurrentPositionAsync({});
  //   // const currentLocation = { coords: { latitude: 50.78959999, longitude: 3.733333 } };
  //   setLocation(currentLocation.coords);

  //   console.log('Current location:', currentLocation.coords);
  // };


  const fetchLocations = async () => {
    try {
      let { data: locationsData, error } = await supabase
        .from('locations')
        .select('hex_index')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (locationsData) {
        const locationsWithCoordinates = locationsData
        .filter(location => h3.h3IsValid(location.hex_index)) // Filter valid hex indexes
        .map(location => {
          const [lat, lng] = h3.h3ToGeo(location.hex_index);
          return { ...location, lat, lng };
        });
        
       
        setLocationsWithCoordinates(locationsWithCoordinates);
        updateMapWithLocations(locationsWithCoordinates);
        console.log('Locations with coordinates:', locationsWithCoordinates);
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

  const updateMapWithLocations = (locationsWithCoordinates) => {
    const features = locationsWithCoordinates.map(location => {
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

    const hexGeoJson = {
      type: 'FeatureCollection',
      features: features
    };

    setHexagons(hexGeoJson);
  };

  const clusterHexagons = (locationsWithCoordinates, resolution) => {
    const clusters = locationsWithCoordinates.reduce((acc, location) => {
      const clusterIndex = h3.geoToH3(location.lat, location.lng, resolution);
      if (!acc[clusterIndex]) {
        acc[clusterIndex] = { count: 0, hexes: [], center: h3.h3ToGeo(clusterIndex) };
      }
      acc[clusterIndex].count += 1;
      acc[clusterIndex].hexes.push(location);
      return acc;
    }, {});

    const clusterFeatures = Object.values(clusters).map(cluster => {
      const boundary = h3.h3ToGeoBoundary(h3.geoToH3(cluster.center[0], cluster.center[1], resolution), true);
      return {
        type: 'Feature',
        properties: {
          count: cluster.count
        },
        geometry: {
          type: 'Polygon',
          coordinates: [boundary]
        }
      };
    });

    const clusterGeoJson = {
      type: 'FeatureCollection',
      features: clusterFeatures
    };

    setClusters(clusterGeoJson);
  };

  const handleRegionDidChange = async () => {
    if (mapRef.current) {
      const currentZoomLevel = await mapRef.current.getZoom();
      console.log('Current zoom level:', currentZoomLevel);
      setZoomLevel(currentZoomLevel);
      const resolution = currentZoomLevel < 9.8 ? 6 : currentZoomLevel < 11.7 ? 7 : 9;
      clusterHexagons(locationsWithCoordinates, resolution);
      setLineWidth(currentZoomLevel < 13.5 ? 1 : 2.5);
    }
  };

  const centerMapOnUser = () => {
    if (cameraRef.current && location) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: zoomLevel,
        animationDuration: 1000,
      });
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

        {clusters && (
          <ShapeSource id="clusters" shape={clusters}>
            <FillLayer id="clusterFill" style={ {
              fillColor: Colors.primaryGreen,
              fillOutlineColor: Colors.secondaryGreen,
              fillOpacity: 0.10,
            }} />
            <LineLayer id="clusterLine" style={{
              lineColor: Colors.secondaryGreen,
              lineWidth: lineWidth,
            }} />
            { zoomLevel <= 11.7 && (
            <SymbolLayer 
              id="clusterCount" 
              style={{
                textField: ['format', ['get', 'count'], {}],
                textSize: [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  6.5, 0,
                  7, 12,
                  7.5, 20,
                  10, 30
                ],
                textColor: Colors.secondaryGreen,
                textIgnorePlacement: false,
                textAllowOverlap: true,
              }} 
            />
          )}
          </ShapeSource>
        )} 

        {hexagons && zoomLevel >= 11.7 && (
          <ShapeSource id="hexagons" shape={hexagons}>
            <FillLayer id="hexagonFill" style={ {
              fillColor: Colors.primaryGreen,
              fillOutlineColor: Colors.secondaryGreen,
              fillOpacity: 0.10,
            }} />
            <LineLayer id="hexagonLine" style={{
              lineColor: Colors.secondaryGreen,
              lineWidth: lineWidth,
            }} />
          </ShapeSource>
        )}

        <Mapbox.PointAnnotation
          id="userLocation"
          coordinate={[location.longitude, location.latitude]}
          title="Your location"
          aboveLayerID="hexagonFill"
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
              height: 24,
              width: 24,
              borderRadius: 50,
              backgroundColor: Colors.secondaryGreen,
              borderColor: '#fff',
              borderWidth: 3
            }} />
          </View>
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
      <TouchableOpacity style={styles.buttonContainer} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={28} style={styles.navIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  map: {
    width: '100%',
    height: '115%',
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
    elevation: 2,
  },
  navIcon: {
    color: Colors.secondaryGreen,
  },
});

export default Map;
