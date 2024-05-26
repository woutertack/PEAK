import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Layout } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import Avatar from '../components/Avatar';
import { format, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '../lib/initSupabase';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import CardStats from '../components/cards/CardStats';
import { calculateStreak } from '../components/utils/streaks/CalculateStreak';
import { calculateMaxStreak } from '../components/utils/streaks/CalculateMaxStreak';
import { AuthContext } from '../provider/AuthProvider';

const FriendsProfile = ({ navigation }) => {
  const route = useRoute();
  const { friendId } = route.params;
  const { session } = useContext(AuthContext);
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [totalActiveDays, setTotalActiveDays] = useState(0);
  const [winLossRecord, setWinLossRecord] = useState({ userWins: 0, friendWins: 0 });

  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0); 
  const [totalDistance, setTotalDistance] = useState(0);

  useEffect(() => {
    getFriendProfile();
    getProfileLocations();
    getWinLossRecord();
  }, [friendId]);

  async function getFriendProfile() {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, avatar_url, created_at, total_steps, total_distance_km`)
        .eq('id', friendId)
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
  }

  async function getProfileLocations() {
    try {
      const { data, error, status } = await supabase
        .from('locations')
        .select('visited_at')
        .eq('user_id', friendId)
        .order('visited_at', { ascending: true });
      if (error && status !== 406) {
        throw error;
      }
    
      if (data) {
        console.log(data);
        const streak = calculateStreak(data);
        setCurrentStreak(streak.currentStreak);
        console.log('Current streak:', streak.currentStreak);
        const maxStreakValue = calculateMaxStreak(data);
        setMaxStreak(maxStreakValue);
        console.log('Max streak:', maxStreakValue);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getWinLossRecord() {
    try {
      const { data, error, status } = await supabase
        .from('versus')
        .select('winner, creator_id, friend_id')
        .or(`creator_id.eq.${userId},friend_id.eq.${userId}`)
        .or(`creator_id.eq.${friendId},friend_id.eq.${friendId}`);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log(data)
        const userWins = data.filter(challenge => challenge.winner === userId).length;
        const friendWins = data.filter(challenge => challenge.winner === friendId).length;
        setWinLossRecord({ userWins, friendWins });
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  const formattedDate = createdAt
    ? `Lid sinds ${format(new Date(createdAt), 'MMMM yyyy', { locale: nl })}`
    : '';

  return (
    <>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
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
            <Text style={styles.headerText}>Vrienden</Text>
            <View style={styles.iconPlaceholder} />
          </View>
          <View style={styles.profileContainer}>
            <View pointerEvents='none'>
              <Avatar rounded url={avatarUrl} size={180} containerStyle={styles.avatar} />
            </View>
            <Text style={styles.nameText}>{`${firstName} ${lastName}`}</Text>
            <Text style={styles.memberSinceText}>{formattedDate}</Text>
           
            <View style={styles.buttonsContainer}>
              <View style={styles.viewBadgesButton} pointerEvents='none'>
                <TertiaryButton label={`${winLossRecord.userWins} vs ${winLossRecord.friendWins}`} />
              </View>
              
              <View style={styles.viewBadgesButton}>
                <PrimaryButton label={'Nu uitdagen'} onPress={() => navigation.navigate('CreateVersus',  { friendId })} />
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
    </>
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
  icon: {
    color: Colors.white,
  },
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
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

export default FriendsProfile;
