import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Settings } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button, Layout } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import Avatar from '../components/Avatar';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import CardStats from '../components/cards/CardStats';
import { AuthContext } from '../provider/AuthProvider';
import { supabase } from '../lib/initSupabase';
import useStatusBar from '../helpers/useStatusBar';
import { useHealthConnect } from '../provider/HealthConnectProvider'; // Import the hook

export default function Account({navigation }) {
  const { session } = useContext(AuthContext);
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { readData, steps, distance } = useHealthConnect(); // Use the hook and get steps
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0); // New state for total steps
  const [totalDistance, setTotalDistance] = useState(0); // New state for total distance

  // const fetchProfile = async () => {
  //   try {
  //     if (!session?.user) throw new Error('No user on the session!');
  //     const { data, error, status } = await supabase
  //       .from('profiles')
  //       .select('first_name, last_name, avatar_url, created_at, total_steps, total_distance_km')
  //       .eq('id', session?.user.id)
  //       .single();
  //     if (error && status !== 406) {
  //       throw error;
  //     }
  //     if (data) {
  //       setFirstName(data.first_name);
  //       setLastName(data.last_name);
  //       setAvatarUrl(data.avatar_url);
  //       setCreatedAt(data.created_at);
  //       setTotalSteps(data.total_steps);
  //       setTotalDistance(data.total_distance_km);
        
  //       const createdAtDate = new Date(data.created_at);
  //       const currentDate = new Date();
  //       const daysActive = differenceInDays(currentDate, createdAtDate);
  //       setTotalActiveDays(daysActive);

        
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       Alert.alert(error.message);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const signOut = async () => {
    try {
      if (!session || !session.user) {
        throw new Error('No user session available!');
      }
      await supabase.auth.signOut();
      
    } catch (error) {
      console.log('Error logging out:', error.message);
    }
  };



  return (
    <Layout>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TabBarIcon
            library="AntDesign"
            icon="arrowleft"
            size={38}
            style={styles.icon}
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />
          <Text style={styles.headerText}>Settings</Text>
          <View style={styles.iconPlaceholder} />
        </View>
        <View style={{ alignItems: 'start', marginTop: 20 }}>
          <View style={{ flexDirection: 'column',}}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 10 }}>Wil je van niveau veranderen? Klik hier</Text>
            <View style={{ maxWidth: 175}}>
              <SecondaryButton label="Verander niveau" onPress={() => navigation.navigate('SelectLevelUser')} />
            </View>
          </View>

          <View style={{ flexDirection: 'column', marginTop: 10}}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 10 }}>Uitloggen? Klik hier</Text>
            <View style={{ maxWidth: 175}}>
              <TertiaryButton label="Uitloggen" onPress={() => signOut()} />
            </View>
          </View>

          <View style={{ flexDirection: 'column', marginTop: 10}}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 0 }}>Account verwijderen? </Text>
            <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'normal', marginBottom: 10 }}>(Dit verwijdert al je gegevens) </Text>
            <View style={{ maxWidth: 190}}>
              <Button text="Verwijder account" status="danger" />
            </View>
          </View>

          
        </View>
        
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryGreen,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distributes space around elements
  },

  backIcon: {
    marginRight: 10,
  },
  settingsIcon: {
    marginLeft: 'auto',
    color: '#fff',
    
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },  
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
  },
  
});

