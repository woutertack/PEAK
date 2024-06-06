import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Layout, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import CardChallenge from '../components/cards/CardChallenge';
import { useHealthConnect } from '../provider/HealthConnectProvider';
import { supabase } from '../lib/initSupabase';
import { AuthContext } from '../provider/AuthProvider';
import useLocationData from '../helpers/useLocationData';
import getRandomChallenge from '../components/utils/challenges/getRandomChallenge';
import calculateInitialTimeLeft from '../components/utils/challenges/calculateInitialTimeLeft';
import formatChallengeDescription from '../components/utils/challenges/formatChallengeDescription';
import { err } from 'react-native-svg';

const Challenges = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [monthlyChallenge, setMonthlyChallenge] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const { session } = useContext(AuthContext);
  const { readHealthData } = useHealthConnect();
  const userId = session?.user?.id;

 

 
    const fetchChallenges = async () => {
      try {
        if (!userId) {
          throw new Error('User not logged in');
        }

        // Fetch user profile to get the level
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('level')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw new Error('Error fetching user profile');
        }

        let levelMultiplier = 1;
        switch (profileData.level) {
          case 'medium':
            levelMultiplier = 2;
            break;
          case 'hard':
            levelMultiplier = 3;
            break;
        }

        // Fetch existing daily challenge
        const { data: dailyData, error: dailyError } = await supabase
          .from('challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'daily')
          .order('creation_time', { ascending: false })
          .limit(1)
          .single();

        const { data: weeklyData, error: weeklyError } = await supabase
          .from('challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'weekly')
          .order('creation_time', { ascending: false })
          .limit(1)
          .single();

        const { data: monthlyData, error: monthlyError } = await supabase
          .from('challenges')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'monthly')
          .order('creation_time', { ascending: false })
          .limit(1)
          .single();

        if ((dailyError && dailyError.code !== 'PGRST116') ||
            (weeklyError && weeklyError.code !== 'PGRST116') ||
            (monthlyError && monthlyError.code !== 'PGRST116')) {
          throw new Error('Error fetching challenges');
        }

        const now = new Date();
        const dailyCreationTime = dailyData ? new Date(dailyData.creation_time) : null;
        const weeklyCreationTime = weeklyData ? new Date(weeklyData.creation_time) : null;
        const monthlyCreationTime = monthlyData ? new Date(monthlyData.creation_time) : null;

        // If no daily challenge exists or it has expired, create a new one
        if (!dailyData || (now - dailyCreationTime) > (24 * 60 * 60 * 1000)) {
          const newDailyChallenge = getRandomChallenge('daily', levelMultiplier);
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newDailyChallenge, user_id: userId }]);

          if (error) throw error;

          setDailyChallenge(newDailyChallenge);
          calculateProgress(newDailyChallenge, 'daily');
        } else {
          setDailyChallenge(dailyData);
          calculateProgress(dailyData, 'daily');
        }

        // If no weekly challenge exists or it has expired, create a new one
        if (!weeklyData || (now - weeklyCreationTime) > (7 * 24 * 60 * 60 * 1000)) {
          const newWeeklyChallenge = getRandomChallenge('weekly', levelMultiplier);
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newWeeklyChallenge, user_id: userId }]);

          if (error) throw error;

          setWeeklyChallenge(newWeeklyChallenge);
          calculateProgress(newWeeklyChallenge, 'weekly');
        } else {
          setWeeklyChallenge(weeklyData);
          calculateProgress(weeklyData, 'weekly');
        }

        // If no monthly challenge exists or it has expired, create a new one
        if (!monthlyData || (now - monthlyCreationTime) > (30 * 24 * 60 * 60 * 1000)) {
          const newMonthlyChallenge = getRandomChallenge('monthly', levelMultiplier);
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newMonthlyChallenge, user_id: userId }]);

          if (error) throw error;

          setMonthlyChallenge(newMonthlyChallenge);
          calculateProgress(newMonthlyChallenge, 'monthly');
        } else {
          setMonthlyChallenge(monthlyData);
          calculateProgress(monthlyData, 'monthly');
        }

        setLoading(false);
      } catch (error) {
        Alert.alert('Error fetching challenges', error.message);
        setLoading(false);
      }
    };

    const calculateProgress = async (challenge, type) => {
      const { totalSteps, totalDistance } = await readHealthData(challenge.creation_time);

      let progress = 0;
      
      if (challenge.challenge_type === 'hexagons') {
        // Fetch hexagon data
        const { data: hexagons, error } = await supabase
          .from('locations')
          .select('visited_at')
          .eq('user_id', userId)
          .gte('visited_at', challenge.creation_time);
    
        if (error) {
          console.error('Error fetching hexagon data:', error);
          return;
        }
    
        progress = hexagons.length / challenge.goal;
      } else {
        switch (challenge.challenge_type) {
          case 'steps':
            progress = totalSteps / challenge.goal;
            break;
          case 'distance':
            progress = totalDistance / challenge.goal; // The goal is in kilometers
            break;
          default:
            progress = 0;
        }
      }
    
      if (type === 'daily') {
        setDailyProgress(progress);
      } else if (type === 'weekly') {
        setWeeklyProgress(progress);
      } else if (type === 'monthly') {
        setMonthlyProgress(progress);
      }
    
      // Update the completed state in Supabase if the goal is reached
      if (progress >= 1) {
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


    useEffect(() => {
      fetchChallenges();
    }, [session, readHealthData]);
  
    useFocusEffect(
      useCallback(() => {
        fetchChallenges();
      }, [session, readHealthData])
    );
  

  const restartChallenge = async (type) => {
    try {
      const levelMultiplier = 1; // Adjust based on user level if necessary
      const newChallenge = getRandomChallenge(type, levelMultiplier);
      const { error } = await supabase
        .from('challenges')
        .insert([{ ...newChallenge, user_id: userId }]);

      if (error) {
        Alert.alert('Error starting new challenge', error.message);
      } else {
        if (type === 'daily') {
          setDailyChallenge(newChallenge);
          calculateProgress(newChallenge, 'daily');
        } else if (type === 'weekly') {
          setWeeklyChallenge(newChallenge);
          calculateProgress(newChallenge, 'weekly');
        } else if (type === 'monthly') {
          setMonthlyChallenge(newChallenge);
          calculateProgress(newChallenge, 'monthly');
        }
        Alert.alert('New challenge started');
      }
    } catch (error) {
      Alert.alert('Error starting new challenge', error.message);
    }
  };

  if (loading  || !dailyChallenge || !weeklyChallenge || !monthlyChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: Colors.white}}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout style={{ flex: 1 }}>
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
            <Text style={styles.headerText}>Uitdagingen</Text>
            <View style={styles.iconPlaceholder} />
          </View>
          <CardChallenge
            key={`daily-${dailyChallenge.type}`}
            title={`Dagelijkse uitdaging`}
            progress={dailyProgress}
            description={formatChallengeDescription(dailyChallenge.challenge_type, dailyChallenge.goal)}
            initialTimeLeft={calculateInitialTimeLeft(dailyChallenge.creation_time, dailyChallenge.type)}
            type={dailyChallenge.type}
            creationTime={dailyChallenge.creation_time}
            completed={dailyProgress >= 1}
            onRestart={() => restartChallenge('daily')}
          />
          <CardChallenge
            key={`weekly-${weeklyChallenge.type}`}
            title={`Wekelijkse uitdaging`}
            progress={weeklyProgress}
            description={formatChallengeDescription(weeklyChallenge.challenge_type, weeklyChallenge.goal)}
            initialTimeLeft={calculateInitialTimeLeft(weeklyChallenge.creation_time, weeklyChallenge.type)}
            type={weeklyChallenge.type}
            creationTime={weeklyChallenge.creation_time}
            completed={weeklyProgress >= 1}
            onRestart={() => restartChallenge('weekly')}
          />
          <CardChallenge
            key={`monthly-${monthlyChallenge.type}`}
            title={`Maandelijkse uitdaging`}
            progress={monthlyProgress}
            description={formatChallengeDescription(monthlyChallenge.challenge_type, monthlyChallenge.goal)}
            initialTimeLeft={calculateInitialTimeLeft(monthlyChallenge.creation_time, monthlyChallenge.type)}
            type={monthlyChallenge.type}
            creationTime={monthlyChallenge.creation_time}
            completed={monthlyProgress >= 1}
            onRestart={() => restartChallenge('monthly')}
          />
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryGreen,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondaryGreen,
  },
});

export default Challenges;
