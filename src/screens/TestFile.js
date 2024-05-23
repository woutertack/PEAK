import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import CardChallenge from '../components/cards/CardChallenge';
import { useHealthConnect } from '../provider/HealthConnectProvider';
import { supabase } from '../lib/initSupabase';
import { AuthContext } from '../provider/AuthProvider';

const challengeTemplates = [
  {
    challenge_type: 'steps',
    title: 'Stappen',
    goalRange: [5000, 20000],
    description: goal => `Zet ${goal} stappen`,
  },
  {
    challenge_type: 'distance',
    title: 'Afstand',
    goalRange: [3, 10], // in kilometers
    description: goal => `Loop ${goal} kilometer`,
  },
  {
    challenge_type: 'hexagons',
    title: 'Ontdek gebieden',
    goalRange: [1, 10],
    description: goal => `Ontdek ${goal} nieuwe gebieden`,
  },
];

const getRandomChallenge = (type) => {
  const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
  const challenge = challengeTemplates[randomIndex];
  const goal = Math.floor(Math.random() * (challenge.goalRange[1] - challenge.goalRange[0] + 1)) + challenge.goalRange[0];
  const creationTime = new Date().toISOString();

  return {
    challenge_type: challenge.challenge_type,
    title: challenge.title,
    goal,
    description: challenge.description(goal),
    creation_time: creationTime,
    type,
  };
};

const calculateTimeLeft = (creationTime, type) => {
  const now = new Date().getTime();
  const creationTimestamp = new Date(creationTime).getTime();
  const elapsedTime = now - creationTimestamp;
  let totalTime;

  switch (type) {
    case 'daily':
      totalTime = 24 * 60 * 60 * 1000; // 24 hours
      break;
    case 'weekly':
      totalTime = 7 * 24 * 60 * 60 * 1000; // 7 days
      break;
    case 'monthly':
      const currentMonth = new Date(creationTime).getMonth();
      const nextMonth = new Date(creationTime).setMonth(currentMonth + 1);
      totalTime = nextMonth - creationTimestamp;
      break;
    default:
      totalTime = 0;
  }

  const remainingTime = totalTime - elapsedTime;
  const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingTime / 1000) % 60);
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

  if (type === 'daily') {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (type === 'weekly') {
    return `${days}d ${hours}h`;
  } else if (type === 'monthly') {
    return `${days}d ${hours}h`;
  }
};

const Challenges = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [monthlyChallenge, setMonthlyChallenge] = useState(null);
  const { steps, distance } = useHealthConnect();
  const { session } = useContext(AuthContext);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const userId = session?.user?.id;

        if (!userId) {
          throw new Error('User not logged in');
        }

        // Fetch existing challenges
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

        if (dailyError || weeklyError || monthlyError) {
          throw new Error('Error fetching challenges');
        }

        const now = new Date();
        const dailyCreationTime = new Date(dailyData?.creation_time);
        const weeklyCreationTime = new Date(weeklyData?.creation_time);
        const monthlyCreationTime = new Date(monthlyData?.creation_time);

        // If no daily challenge exists or it has expired, create a new one
        if (!dailyData || (now - dailyCreationTime) > (24 * 60 * 60 * 1000)) {
          const newDailyChallenge = getRandomChallenge('daily');
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newDailyChallenge, user_id: userId }]);

          if (error) throw error;

          setDailyChallenge(newDailyChallenge);
        } else {
          setDailyChallenge(dailyData);
        }

        // If no weekly challenge exists or it has expired, create a new one
        if (!weeklyData || (now - weeklyCreationTime) > (7 * 24 * 60 * 60 * 1000)) {
          const newWeeklyChallenge = getRandomChallenge('weekly');
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newWeeklyChallenge, user_id: userId }]);

          if (error) throw error;

          setWeeklyChallenge(newWeeklyChallenge);
        } else {
          setWeeklyChallenge(weeklyData);
        }

        // If no monthly challenge exists or it has expired, create a new one
        if (!monthlyData || (now - monthlyCreationTime) > (30 * 24 * 60 * 60 * 1000)) {
          const newMonthlyChallenge = getRandomChallenge('monthly');
          const { error } = await supabase
            .from('challenges')
            .insert([{ ...newMonthlyChallenge, user_id: userId }]);

          if (error) throw error;

          setMonthlyChallenge(newMonthlyChallenge);
        } else {
          setMonthlyChallenge(monthlyData);
        }

        setLoading(false);
      } catch (error) {
        Alert.alert('Error fetching challenges', error.message);
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [session]);

  const calculateProgress = (challenge) => {
    switch (challenge.challenge_type) {
      case 'steps':
        return steps / challenge.goal;
      case 'distance':
        return distance / (challenge.goal * 1000); // Convert kilometers to meters
      case 'hexagons':
        // Implement the logic for hexagons if you have the data available
        return 0; // Placeholder
      default:
        return 0;
    }
  };

  if (loading || !dailyChallenge || !weeklyChallenge || !monthlyChallenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
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
            title={`Dagelijkse uitdaging: ${dailyChallenge.title}`}
            progress={calculateProgress(dailyChallenge)}
            description={dailyChallenge.description}
            timeLeft={calculateTimeLeft(dailyChallenge.creation_time, dailyChallenge.type)}
          />
          <CardChallenge
            key={`weekly-${weeklyChallenge.type}`}
            title={`Wekelijkse uitdaging: ${weeklyChallenge.title}`}
            progress={calculateProgress(weeklyChallenge)}
            description={weeklyChallenge.description}
            timeLeft={calculateTimeLeft(weeklyChallenge.creation_time, weeklyChallenge.type)}
          />
          <CardChallenge
            key={`monthly-${monthlyChallenge.type}`}
            title={`Maandelijkse uitdaging: ${monthlyChallenge.title}`}
            progress={calculateProgress(monthlyChallenge)}
            description={monthlyChallenge.description}
            timeLeft={calculateTimeLeft(monthlyChallenge.creation_time, monthlyChallenge.type)}
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
