import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Layout } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import Avatar from '../components/Avatar';
import { format, differenceInDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '../lib/initSupabase';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import CardStats from '../components/cards/CardStats';
import { calculateStreak } from '../components/utils/streaks/CalculateStreak';
import { calculateMaxStreak } from '../components/utils/streaks/CalculateMaxStreak';
import { AuthContext } from '../provider/AuthProvider';
import useStatusBar from '../helpers/useStatusBar';


const FriendsProfile = ({ navigation }) => {
  const route = useRoute();
  const { friendId } = route.params;
  const { session } = useContext(AuthContext);
  const userId = session?.user.id;
  useStatusBar(Colors.secondaryGreen, 'light-content');

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
  const [hexagons, setHexagons] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0); 
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getFriendProfile();
      getProfileLocations();
      getWinLossRecord();
      fetchCompletedChallenges();
      checkFriendshipStatus();
    }, [friendId])
  );
  async function getFriendProfile() {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, avatar_url, created_at, total_steps, total_distance_km, total_hexagons, total_visits`)
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
        setHexagons(data.total_hexagons );
       
        setTotalVisits(data.total_visits || 0);

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
        .select('visit_times')
        .eq('user_id', friendId);
  
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

  const fetchCompletedChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', friendId)
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

  async function checkFriendshipStatus() {
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('status')
        .or(`requester_id.eq.${userId},requestee_id.eq.${userId}`)
        .or(`requester_id.eq.${friendId},requestee_id.eq.${friendId}`)
        .eq('status', 'accepted');

      if (error) {
        throw error;
      }

      setIsFriend(data.length > 0);

      if (!isFriend) {
        const { data: requestData, error: requestError } = await supabase
          .from('friend_requests')
          .select('status')
          .or(`requester_id.eq.${userId},requestee_id.eq.${userId}`)
          .or(`requester_id.eq.${friendId},requestee_id.eq.${friendId}`)
          .eq('status', 'pending');

        if (requestError) {
          throw requestError;
        }

        setRequestSent(requestData.length > 0);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  const handleAddFriend = async (requesteeId) => {
    // Check if there is already a friend request with the same status
    const { data: existingRequests, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`requester_id.eq.${session.user.id},requestee_id.eq.${session.user.id}`)
      .or(`requester_id.eq.${requesteeId},requestee_id.eq.${requesteeId}`)
      .eq('status', 'pending');

    if (fetchError) {
      Alert.alert('Error', 'Failed to check existing friend requests');
      return;
    }

    if (existingRequests.length > 0) {
      setRequestSent(true);
      Alert.alert('Info', 'Vriendschapsverzoek is al verstuurd');
      return;
    }

    // If no existing friend request, insert a new one
    const { error: insertError } = await supabase.from('friend_requests').insert([
      { requester_id: session.user.id, requestee_id: requesteeId, status: 'pending' }
    ]);

    if (insertError) {
      Alert.alert('Error', 'Failed to send friend request');
    } else {
      setRequestSent(true);
      Alert.alert('Success', 'Vriendschapsverzoek verstuurd');
    }
  };
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
           
            {isFriend ? (
              <>
                <View style={styles.buttonsContainer}>
                  <View style={styles.viewBadgesButton} pointerEvents='none'>
                    <TertiaryButton label={`${winLossRecord.userWins}(Jij) vs ${winLossRecord.friendWins}`} />
                  </View>
                  <View style={styles.viewBadgesButton}>
                    <PrimaryButton label={'Nu uitdagen'} onPress={() => navigation.navigate('CreateVersus', { friendId })} />
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
              </>
            ) : (
              <SecondaryButton label={requestSent ? 'Vriendschapsverzoek verstuurd' : 'Stuur Vriendschapsverzoek'} onPress={() => handleAddFriend(friendId)} disabled={requestSent} />
            )}
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
    marginTop: 25,
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
