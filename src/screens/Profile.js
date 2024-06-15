import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
import { supabase, supabaseAdmin } from '../lib/initSupabase';
import { calculateStreak } from '../components/utils/streaks/CalculateStreak'; // Import the calculateStreak function
import { calculateMaxStreak } from '../components/utils/streaks/CalculateMaxStreak';
import useStatusBar from '../helpers/useStatusBar';
import { useHealthConnect } from '../provider/HealthConnectProvider'; // Import the hook
import LogoutIcon from '../components/utils/icons/LogoutIcon';
import DeleteIcon from '../components/utils/icons/DeleteIcon';

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
  const [hexagons, setHexagons] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0); // New state for total steps
  const [totalDistance, setTotalDistance] = useState(0); // New state for total distance
  const [completedChallenges, setCompletedChallenges] = useState(0); 



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
      .select('visit_times')
      .eq('user_id', session.user.id)
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log(data.length);
        setHexagons(data.length);
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

  const fetchCompletedChallenges = async () => {
    try {
      if (!session?.user) throw new Error('No user on the session!');
      const { data, error } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('completed', true);
      if (error) {
        throw error;
      }
      setCompletedChallenges(data.length);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  };

  const getTotalVisits = async () => {
    try {
      if (!session?.user) throw new Error('No user on the session!');
      const { data, error, status } = await supabase
        .from('locations')
        .select('visit_times')
        .eq('user_id', session.user.id)
       
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
       

        const allVisits = data.flatMap(location => location.visit_times || []);
        const totalVisits = allVisits.length;
        
    
        setTotalVisits(totalVisits || 0);
      
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!session || !session.user) {
        throw new Error('No user session available!');
      }
      
      // Show an alert to confirm sign-out
      Alert.alert(
        'Uitloggen',
       'Weet je zeker dat je wilt uitloggen?',
        [
          {
            text: 'Annuleer',
            style: 'cancel',
          },
          {
            text: 'Uitloggen',
            onPress: async () => {
              // If user confirms, sign out
              await supabase.auth.signOut();
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.log('Error logging out:', error.message);
    }
  };


  const deleteUser = async (userId) => {
    try {
      // Delete from friend_requests table
      const { error: errorFriendRequests } = await supabase.from('friend_requests').delete().or(`requester_id.eq.${userId},requestee_id.eq.${userId}`);
      if (errorFriendRequests) throw errorFriendRequests;
  
      // Delete from locations table
      const { error: errorLocations } = await supabase.from('locations').delete().eq('user_id', userId);
      if (errorLocations) throw errorLocations;
  
      // Delete from versus table
      const { error: errorVersus } = await supabase.from('versus').delete().or(`creator_id.eq.${userId},friend_id.eq.${userId}`);
      if (errorVersus) throw errorVersus;
  
      // Delete from challenges table
      const { error: errorChallenges } = await supabase.from('challenges').delete().eq('user_id', userId);
      if (errorChallenges) throw errorChallenges;
  
      // Delete from profiles table
      const { error: errorProfiles } = await supabase.from('profiles').delete().eq('id', userId);
      if (errorProfiles) throw errorProfiles;
  
      // Finally, delete the user from the authentication table
      const { error: errorAuth } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (errorAuth) throw errorAuth;
  
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (error) {
      console.log('Error deleting user:', error.message);
    }
  };
  
  
const handleDeleteUser = (userId) => {
  // Show an alert to confirm deletion
  Alert.alert(
    'Account verwijderen',
    'Weet je zeker dat je uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
    [
      {
        text: 'Annuleer',
        style: 'cancel',
      },
      {
        text: 'Verwijder account',
        onPress: async () => {
          // If user confirms, delete the user
          await deleteUser(userId);
        },
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
};

  

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchProfileLocations();
      fetchCompletedChallenges();
      getTotalVisits();
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
              navigation.navigate('Home');
            }}
          />
          <Text style={styles.headerText}>Profiel</Text>
         
            <TouchableOpacity onPress={() => signOut()}>
              <LogoutIcon  />
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          <View pointerEvents='none'>
            <Avatar rounded url={avatarUrl} size={180} containerStyle={styles.avatar} />
          </View>
          <View style={styles.nameWrapper}>
            <Text style={styles.nameText}>{`${firstName} ${lastName}`}</Text>
            <TouchableOpacity onPress={() => handleDeleteUser(session.user.id) } style={styles.delete}>
              <DeleteIcon />
            </TouchableOpacity>
          </View>
          {/* TO DO ADD AGE */}
          <Text style={styles.memberSinceText}>{formattedDate}</Text>
          <View style={styles.buttonsContainer}>
            <View style={styles.viewBadgesButton}>
              <TertiaryButton label={'Wijzig profiel'} onPress={() => navigation.navigate('EditProfile')} />
            </View>
            <View style={styles.viewBadgesButton}>
              <PrimaryButton label={'Verander niveau'} onPress={() => navigation.navigate('SelectLevelUser')} />
            </View>
            <View style={styles.viewBadgesButton}>
              
            </View>
          </View>
          <View style={styles.statsContainer}>
            <CardStats number={totalSteps} label="Totaal stappen" />
            <CardStats number={totalDistance} label="Totaal km" />
            <CardStats number={maxStreak} label="Langste streak" />
            <CardStats number={totalVisits} label="Totaal ontdekte gebieden" />
            <CardStats number={hexagons} label="Unieke gebieden ontdekt" />
            <CardStats number={completedChallenges} label="Voltooide uitdagingen" />
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
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'start',
    marginTop: 25,
  },
  avatar: {
    marginBottom: 20,
  
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameWrapper: {
    flexDirection: 'row',
   
    alignItems: 'center',
    marginBottom: 10,
  },
  delete: {
    marginLeft: 10,
    marginTop: 2
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
