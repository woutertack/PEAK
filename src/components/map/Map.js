import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox, { ShapeSource, FillLayer, LineLayer, SymbolLayer } from '@rnmapbox/maps';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../provider/AuthProvider';
import LocationHandler from './LocationHandler';
import MapLayers from './MapLayers';
import * as Location from 'expo-location'; // Import Location directly for initial fetching
import { supabase } from '../../lib/initSupabase.js';
import Colors from '../../consts/Colors.js';
import CheckIcon from '../utils/icons/CheckIcon';

Mapbox.setAccessToken("pk.eyJ1Ijoid291dGVydGFjayIsImEiOiJja3A3MWV4NzcwdzVhMnRxdHJmcmJzbWZtIn0.3DtWFcL1fG0pk3JsABoTpA");
const h3 = require("h3-reactnative");

const Map = ({ onHexagonCaptured }) => {
  const { session } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [hexagons, setHexagons] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [locationsWithCoordinates, setLocationsWithCoordinates] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(14.5);

  const userId = session?.user.id;
  const mapRef = useRef(null);
  const cameraRef = useRef(null);

  // Fetch initial location
  useEffect(() => {
    const fetchInitialLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        console.log('Initial location:', currentLocation.coords);

        // Center map on initial load
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: [currentLocation.coords.longitude, currentLocation.coords.latitude],
            zoomLevel: zoomLevel,
            animationDuration: 1000,
          });
        }
      } catch (error) {
        console.error('Error fetching initial location:', error);
      }
    };

    fetchInitialLocation();
  }, []);

  // Handle location updates without centering the map
  useEffect(() => {
    if (location) {
      // console.log('Location updated:', location);
      updateHexagons(location);
    }
  }, [location]);

  useEffect(() => {
    if (userId) {
      fetchLocations();
    }
  }, [userId]);

  const fetchLocations = useCallback(async () => {
    try {
      let { data: locationsData, error } = await supabase
        .from('locations')
        .select('hex_index, visits') // Include visits column
        .eq('user_id', userId);

      if (error) throw error;

      if (locationsData) {
        const validLocations = locationsData
          .filter(location => h3.h3IsValid(location.hex_index))
          .map(location => {
            const [lat, lng] = h3.h3ToGeo(location.hex_index);
            return { ...location, lat, lng };
          });

        setLocationsWithCoordinates(validLocations);
        // console.log('Locations with coordinates:', validLocations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error.message);
    }
  }, [userId]);

  const checkAndAddHexIndex = useCallback(async (hexIndex) => {
    try {
      // Check if the hex_index exists for the user
      let { data: hexData, error: hexError } = await supabase
        .from('locations')
        .select('hex_index, visits, visit_times')
        .eq('hex_index', hexIndex)
        .eq('user_id', userId);
  
      if (hexError) {
        console.error('Error checking hex index:', hexError);
        return;
      }
  
      const now = new Date().toISOString();
  
      // If the hex_index does not exist, insert it
      if (!hexData.length) {
        const { data, error: insertError } = await supabase
          .from('locations')
          .insert([{ hex_index: hexIndex, user_id: userId, visits: 1, visit_times: [now] }]);
  
        if (insertError) {
          console.error('Error inserting hex index:', insertError);
        } else {
          console.log('Hex index added:', hexIndex);
          onHexagonCaptured();
          fetchLocations();
        }
      } else {
        // Check if the last visit was more than a day ago
        const visitTimes = hexData[0].visit_times || [];
        const lastVisit = visitTimes.length ? new Date(visitTimes[visitTimes.length - 1]) : null;
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        if (!lastVisit || (new Date() - lastVisit) > oneDayInMs) {
          // If the last visit was more than a day ago, update the visits count and append the visit time
          visitTimes.push(now);
  
          const { data, error: updateError } = await supabase
            .from('locations')
            .update({ visits: hexData[0].visits + 1, visit_times: visitTimes })
            .eq('hex_index', hexIndex)
            .eq('user_id', userId);
  
          if (updateError) {
            console.error('Error updating visits count:', updateError);
          } else {
            console.log('Visits count updated for hex index:', hexIndex);
            fetchLocations();
          }
        }
          else {
            console.log('Visits count update skipped for hex index:', hexIndex, );
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  }, [userId, onHexagonCaptured, fetchLocations]);
  

  const updateHexagons = useCallback((loc) => {
    const centerIndex = h3.geoToH3(loc.latitude, loc.longitude, 9);
    checkAndAddHexIndex(centerIndex);
  }, [checkAndAddHexIndex]);

  const clusterHexagons = useCallback((locationsWithCoordinates, resolution) => {
    const clusters = locationsWithCoordinates.reduce((acc, location) => {
      const clusterIndex = h3.geoToH3(location.lat, location.lng, resolution);
      if (!acc[clusterIndex]) {
        acc[clusterIndex] = { count: 0, hexes: [], center: h3.h3ToGeo(clusterIndex), totalVisits: 0 };
      }
      acc[clusterIndex].count += 1;
      acc[clusterIndex].hexes.push(location);
      acc[clusterIndex].totalVisits += location.visits; // Add visits count
      return acc;
    }, {});

    const clusterFeatures = Object.values(clusters).map(cluster => {
      const boundary = h3.h3ToGeoBoundary(h3.geoToH3(cluster.center[0], cluster.center[1], resolution), true);
      return {
        type: 'Feature',
        properties: {
          count: cluster.count,
          totalVisits: cluster.totalVisits, // Add total visits to properties
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
  }, []);

  const handleRegionDidChange = useCallback(async () => {
    if (mapRef.current) {
      const currentZoomLevel = await mapRef.current.getZoom();
      console.log('Current zoom level:', currentZoomLevel);
      setZoomLevel(currentZoomLevel);
      const resolution = currentZoomLevel < 9.8 ? 6 : currentZoomLevel < 12.3 ? 7 : 9;
      clusterHexagons(locationsWithCoordinates, resolution);
    }
  }, [locationsWithCoordinates, clusterHexagons]);

  const centerMapOnUser = () => {
    if (cameraRef.current && location) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 14.5,
        animationDuration: 1000,
      });
      console.log('Map centered on user location:', location);
    }
  };

  const customMapStyle = 'mapbox://styles/woutertack/clw88shyw002i01r06xjcgpwn';

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.black }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={customMapStyle}
        ref={mapRef}
        onMapIdle={handleRegionDidChange}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14.5}
          centerCoordinate={[location.longitude, location.latitude]}
          animationMode="flyTo"
          animationDuration={1000}
          maxZoomLevel={16}
        />
        <MapLayers
          clusters={clusters}
          hexagons={hexagons}
          zoomLevel={zoomLevel}
          lineWidth={lineWidth}
        />
        <Mapbox.PointAnnotation
          id="userLocation"
          coordinate={[location.longitude, location.latitude]}
          title="Your location"
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
      <LocationHandler setLocation={setLocation} />
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
