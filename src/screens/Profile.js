import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Layout } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import Avatar from '../components/Avatar';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import CardStats from '../components/cards/CardStats';
import { AuthContext } from '../provider/AuthProvider';
import { format, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '../lib/initSupabase';
import { calculateStreak } from '../components/utils/streaks/CalculateStreak'; // Import the calculateStreak function
import { calculateMaxStreak } from '../components/utils/streaks/CalculateMaxStreak';
import useStatusBar from '../helpers/useStatusBar';
import { useHealthConnect } from '../provider/HealthConnectProvider'; // Import the hook

const Profile = ({ navigation }) => {
  const { session } = useContext(AuthContext);
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

  const fetchProfile = async () => {
    try {
      if (!session?.user) throw new Error('No user on the session!');
      const { data, error, status } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, created_at, total_steps, total_distance_km')
        .eq('id', session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAvatarUrl(data.avatar_url);
        setCreatedAt(data.created_at);
        setTotalSteps(data.total_steps);
        setTotalDistance(data.total_distance_km);
        
        const createdAtDate = new Date(data.created_at);
        const currentDate = new Date();
        const daysActive = differenceInDays(currentDate, createdAtDate);
        setTotalActiveDays(daysActive);

        
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileLocations = async () => {
    try {
      if (!session?.user) throw new Error('No user on the session!');
      const { data, error, status } = await supabase
        .from('locations')
        .select('visited_at')
        .eq('user_id', session.user.id)
        .order('visited_at', { ascending: true });
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        const streak = calculateStreak(data);
        setCurrentStreak(streak.currentStreak);
        const maxStreakValue = calculateMaxStreak(data);
        setMaxStreak(maxStreakValue);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchProfileLocations();
    }, [session])
  );

  useStatusBar(Colors.secondaryGreen, 'light-content');

  const formattedDate = createdAt ? `Lid sinds ${format(new Date(createdAt), 'MMMM yyyy', { locale: nl })}` : '';

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
              navigation.goBack();
            }}
          />
          <Text style={styles.headerText}>Profiel</Text>
          <TabBarIcon
            library="Ionicons"
            icon="settings-sharp"
            size={32}
            style={styles.settingsIcon}
            onPress={() => {
              navigation.navigate('Settings');
            }}
          />
        </View>
        <View style={styles.profileContainer}>
          <View pointerEvents='none'>
            <Avatar rounded url={avatarUrl} size={180} containerStyle={styles.avatar} />
          </View>
          <Text style={styles.nameText}>{`${firstName} ${lastName}, 22`}</Text>
          {/* TO DO ADD AGE */}
          <Text style={styles.memberSinceText}>{formattedDate}</Text>
          <View style={styles.buttonsContainer}>
            <View style={styles.viewBadgesButton}>
              <TertiaryButton label={'Wijzig profiel'} onPress={() => navigation.navigate('EditProfile')} />
            </View>
            <View style={styles.viewBadgesButton}>
              <PrimaryButton label={'Bekijk badges'} />
            </View>
          </View>
          <View style={styles.statsContainer}>
            <CardStats number={totalSteps} label="Totaal stappen" />
            <CardStats number={totalDistance} label="Totaal km" />
            <CardStats number={totalActiveDays} label="Dagen bezig" />
            <CardStats number={maxStreak} label="Langste streak" />
            <CardStats number={currentStreak} label="Huidige streak" />
            <CardStats number="22" label="Badges" />
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
  profileContainer: {
    alignItems: 'start',
    marginTop: 40,
  },
  avatar: {
    marginBottom: 20,
  
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  locationText: {
    fontSize: 18,
    color: '#d1e8e2',
  },
  memberSinceText: {
    fontSize: 16,
    color: '#d1e8e2',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
   
    width: '100%',
    marginBottom: 10,
    gap: 12,
  },
  editProfileButton: {
    backgroundColor: '#0C4D53',
    borderRadius: 8,
    width: '100%',
  },
  viewBadgesButton: {
    width: '48%',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  statBox: {
    backgroundColor: '#2c7873',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    alignItems: 'center',
    width: '40%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 16,
    color: '#d1e8e2',
  },
});

export default Profile;
