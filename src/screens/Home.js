import React, { useContext, useState, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/initSupabase";
import { Layout, Text } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../consts/Colors";
import Map from "../components/map/Map";
import Target from "../components/utils/icons/Target";
import User from "../components/utils/icons/User";
import FriendsIcon from "../components/utils/icons/FriendsIcon";
import StreakIcon from "../components/utils/streaks/StreakIcon";
import { AuthContext } from "../provider/AuthProvider";
import { calculateStreak } from '../components/utils/streaks/CalculateStreak'; 
import useStatusBar from "../helpers/useStatusBar";
import { useHealthConnect } from "../provider/HealthConnectProvider";
import DailyChallengeCard from "../components/cards/DailyChallengeCard";
import { useFocusEffect } from '@react-navigation/native';

export default function ({ navigation }) {
  const { session } = useContext(AuthContext);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const { readHealthData } = useHealthConnect();

  const fetchStreakData = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select('visited_at')
      .eq('user_id', session.user.id)
      .order('visited_at', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      const streak = calculateStreak(data);
      setCurrentStreak(streak.currentStreak);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const { data: dailyData, error: dailyError } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'daily')
        .order('creation_time', { ascending: false })
        .limit(1)
        .single();

      if (dailyError && dailyError.code !== 'PGRST116') {
        throw new Error('Error fetching daily challenge');
      }

      if (dailyData) {
        const today = new Date();
        const creationDate = new Date(dailyData.creation_time);
        const isToday = today.toDateString() === creationDate.toDateString();

        if (isToday) {
          setDailyChallenge(dailyData);
          calculateDailyProgress(dailyData);
        } else {
          setDailyChallenge(null);
        }
      }
    
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  const calculateDailyProgress = async (challenge) => {
    const { totalSteps, totalDistance } = await readHealthData(challenge.creation_time);
    let progress = 0;

    if (challenge.challenge_type === 'hexagons') {
      const { data: hexagons, error } = await supabase
        .from('locations')
        .select('visited_at')
        .eq('user_id', session.user.id)
        .gte('visited_at', challenge.creation_time);

      if (error) {
        console.error('Error fetching hexagon data:', error);
        return;
      }

      progress = hexagons.length ;
    } else {
      switch (challenge.challenge_type) {
        case 'steps':
          progress = totalSteps;
          break;
        case 'distance':
          progress = totalDistance;
          break;
        default:
          progress = 0;
      }
    }

    setDailyProgress(progress);
    updateChallengeCompletionStatus(challenge, progress);
  };

  const handleHexagonCaptured = () => {
    if (dailyChallenge && dailyChallenge.challenge_type === 'hexagons') {
      const newProgress = dailyProgress + 1;
      setDailyProgress(newProgress);
      updateChallengeCompletionStatus(dailyChallenge, newProgress);
    }
  };

  const updateChallengeCompletionStatus = async (challenge, progress) => {
    if (progress >= challenge.goal) {
      const { error } = await supabase
        .from('challenges')
        .update({ completed: true })
        .eq('id', challenge.id);

      if (error) {
        console.error('Error updating challenge completion status:', error);
      } else {
        console.log('Challenge marked as completed');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStreakData();
      fetchDailyChallenge();
    }, [session.user.id, readHealthData, dailyProgress])
  );

  useStatusBar('transparent', 'dark-content');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout>
        <View style={styles.topNavContainer} pointerEvents="box-none" >
          {/* Left buttons */}
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.toggleDrawer()}>
            <Ionicons name="menu" size={40} color={Colors.secondaryGreen} />
          </TouchableOpacity>
          {/* Right button */}

          <View style={styles.navButtonGroup}>
           
              <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate("Profile")}>
                <User />
              </TouchableOpacity>
         
           
              <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate("Challenges")}>
                <Target />
              </TouchableOpacity>
         
              <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate("Friends")}>
                <FriendsIcon />
              </TouchableOpacity>

     
              <TouchableOpacity style={styles.streakIcon} onPress={() => navigation.navigate("Streaks")}>
                <StreakIcon streak={currentStreak} />
              </TouchableOpacity>
          </View>
        </View>
        <View style={styles.mapSection}>
          <Map onHexagonCaptured={handleHexagonCaptured}/>
        </View>
        {dailyChallenge ? (
          <View style={styles.challengeContainer}>
            <DailyChallengeCard
              progress={dailyProgress}
              goal={dailyChallenge.goal}
              unit={dailyChallenge.challenge_type}
              navigation={navigation}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.noChallengeContainer} onPress={() => navigation.navigate("Challenges")}  activeOpacity={0.9}>
              <Text style={styles.noChallengeText}>Klik hier voor nieuwe uitdaging</Text>
          </TouchableOpacity>
        )}
      </Layout>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'top',
    zIndex: 1,
  },
  navButtonGroup: {
    flexDirection: 'column',
    gap: 12,
  },
  profileIcon: {
    backgroundColor: Colors.secondaryGreen, 
    borderRadius: 12, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 42,
    shadowColor: "#000",
    shadowOffset: {
        width: 5,
        height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  streakIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    width: 45,
    height: 42,
  },
  mapSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  challengeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
   
    borderRadius: 10,
    padding: 5,
  },
  noChallengeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 5,
    color: Colors.secondaryGreen,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'start',
    maxWidth: 200,
  },
  noChallengeText: {
    fontSize: 17,
    color: Colors.secondaryGreen,
    fontWeight: 'bold',
    marginBottom: 0,
    },
    underlineInside : {
      left: 0,
  
    height: 3,  // 3px width
    backgroundColor: Colors.secondaryGreen,
    marginBottom: 10,
    },
});
