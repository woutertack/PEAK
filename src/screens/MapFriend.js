import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Mapbox, { ShapeSource, FillLayer, LineLayer, SymbolLayer } from '@rnmapbox/maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { supabase } from '../lib/initSupabase.js'
import Colors from '../consts/Colors';
// import { AuthContext } from '../../provider/AuthProvider';
// import LocationHandler from './LocationHandler';
import MapLayers from '../components/map/MapLayers.js';
import useStatusBar from '../helpers/useStatusBar.js';
import TabBarIcon from '../components/utils/TabBarIcon.js';

Mapbox.setAccessToken("pk.eyJ1Ijoid291dGVydGFjayIsImEiOiJja3A3MWV4NzcwdzVhMnRxdHJmcmJzbWZtIn0.3DtWFcL1fG0pk3JsABoTpA");
const h3 = require("h3-reactnative");

const MapFriend = ({navigation}) => {
  const route = useRoute();
  const friendId = route.params?.friendId || '';
  const [location, setLocation] = useState(null);
  const [hexagons, setHexagons] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [zoomLevel, setZoomLevel] = useState(14.5);
  const [mapCentered, setMapCentered] = useState(false);
  const [friendLocations, setFriendLocations] = useState([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

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
      } catch (error) {
        console.error('Error fetching initial location:', error);
      }
    };

    fetchInitialLocation();
  }, []);

  // Center map on user when location is fetched for the first time
  useEffect(() => {
    let timeout;
    if (location && !mapCentered) {
      timeout = setTimeout(() => {
        centerMapOnUser();
        setMapCentered(true);
      }, 200); // 1-second delay
    }
    return () => clearTimeout(timeout); // Clear timeout if component unmounts
  }, [location, mapCentered]);

  // Fetch friend's hexagon locations
  useEffect(() => {
    if (friendId) {
      fetchFriendLocations();
      getFriendProfile();
    }
  }, [friendId]);

  const fetchFriendLocations = useCallback(async () => {
    try {
      let { data: locationsData, error } = await supabase
        .from('locations')
        .select('hex_index, visits')
        .eq('user_id', friendId);

      if (error) throw error;

      if (locationsData) {
        const validLocations = locationsData
          .filter(location => h3.h3IsValid(location.hex_index))
          .map(location => {
            const [lat, lng] = h3.h3ToGeo(location.hex_index);
            return { ...location, lat, lng };
          });

        setFriendLocations(validLocations);
      }
    } catch (error) {
      console.error('Error fetching friend locations:', error.message);
    }
  }, [friendId]);

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
      setZoomLevel(currentZoomLevel);
      const resolution = currentZoomLevel < 9.8 ? 6 : currentZoomLevel < 12.3 ? 7 : 9;
      clusterHexagons(friendLocations, resolution);
    }
  }, [friendLocations, clusterHexagons]);

  const centerMapOnUser = () => {
    if (cameraRef.current && location) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        zoomLevel: 14.5,
        animationDuration: 1000,
      });
    }
  };

  async function getFriendProfile() {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name`)
        .eq('id', friendId)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      // setLoading(false);
    }
  }

  const customMapStyle = 'mapbox://styles/woutertack/clw88shyw002i01r06xjcgpwn';

  useStatusBar('transparent', 'dark-content');

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={{ color: Colors.black }}>Map laden...</Text>
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
      <View style={styles.header}>
        <TabBarIcon
              library="AntDesign"
              icon="arrowleft"
              size={45}
              style={styles.iconBack}
              onPress={() => navigation.goBack()}
            />
        <Text style={styles.friendName}>{firstName} {lastName}</Text>
        <View style={{ width: 38 }} />
      </View>
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
    bottom: 30,
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 35,
    paddingBottom:15,
    paddingHorizontal: 20,
    backgroundColor: Colors.secondaryGreen, // Adjust opacity as needed
    zIndex: 1000,
  },
  iconBack: {
    position: 'relative',
    left: 12,
    color: Colors.white,
  },
  friendName: {
    fontSize: 22,
    fontWeight: 'bold',
    top: 5,
    color: Colors.white,
    maxWidth: '80%',
    textAlign: 'center',
  },
});

export default MapFriend;
