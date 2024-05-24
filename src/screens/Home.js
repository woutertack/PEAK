import React, { useContext, useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/initSupabase";
import {
  Layout,
  Text,
} from "react-native-rapi-ui";
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
import DailyChallengeCard from "../components/cards/DailyChallengeCard";  // Import the new component

export default function ({ navigation }) {
  const { session } = useContext(AuthContext);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState(null); // State to hold daily challenge data
  const [dailyProgress, setDailyProgress] = useState(0); // State to hold daily challenge progress
  const {  readHealthData } = useHealthConnect();

  useEffect(() => {
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
          setDailyChallenge(dailyData);
          calculateDailyProgress(dailyData);
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

        progress = hexagons.length / challenge.goal;
      } else {
        switch (challenge.challenge_type) {
          case 'steps':
            progress = totalSteps;
            break;
          case 'distance':
            progress = totalDistance; // The goal is in kilometers
            break;
          default:
            progress = 0;
        }
      }

      setDailyProgress(progress);
    };

    fetchStreakData();
    fetchDailyChallenge();
  }, [session.user.id, readHealthData]);

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
            <View style={styles.profileIcon} pointerEvents="auto">
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <User />
              </TouchableOpacity>
            </View>
            <View style={styles.profileIcon}>
              <TouchableOpacity onPress={() => navigation.navigate("Challenges")}>
                <Target />
              </TouchableOpacity>
            </View>
            <View style={styles.profileIcon}>
              <TouchableOpacity onPress={() => navigation.navigate("Friends")}>
                <FriendsIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.streakIcon}>
              <TouchableOpacity onPress={() => navigation.navigate("Streaks")}>
                <StreakIcon streak={currentStreak} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.mapSection}>
          <Map />
        </View>
        {dailyChallenge && (
          <View style={styles.challengeContainer}>
            <DailyChallengeCard
              progress={dailyProgress}
              goal={dailyChallenge.goal}
              unit={dailyChallenge.challenge_type === 'steps' ? 'steps' : dailyChallenge.challenge_type === 'distance' ? 'km' : 'hexagons'}
            />
          </View>
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
});
