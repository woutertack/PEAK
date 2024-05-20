import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Change this based on your icon choice
import TabBarIcon from "../components/utils/TabBarIcon";
import { Layout } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import Colors from '../consts/Colors';
import StreakIcon2 from '../components/utils/icons/StreakIcon2';
import CheckIcon from '../components/utils/icons/CheckIcon';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import { AuthContext } from '../provider/AuthProvider';
import { supabase } from '../lib/initSupabase';
import { calculateStreak } from '../components/utils/streaks/CalculateStreak'; // Import the calculateStreak function
import { calculateMaxStreak } from '../components/utils/streaks/CalculateMaxStreak';
const StreaksScreen = ({ navigation }) => {
  const { session } = useContext(AuthContext);
  const [streakData, setStreakData] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

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
        console.log(data);
        const streak = calculateStreak(data);
        setCurrentStreak(streak.currentStreak);
        setStreakData(streak.visitDates);

        const maxStreakValue = calculateMaxStreak(data);
        setMaxStreak(maxStreakValue);
        console.log('Max streak:', maxStreakValue);
      }
    };

    fetchStreakData();
  }, []);

  const getLast7Days = () => {
    const days = ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'];
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      result.push({ day: days[day.getDay()], date: day.toDateString() });
    }

    return result;
  };

  const last7Days = getLast7Days();

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
            <Text style={styles.headerText}>Streaks</Text>
            <View style={styles.iconPlaceholder} />
          </View>
          <View>
            <View style={styles.streakInfo}>
              <StreakIcon2 />
              <View style={styles.streakInfoWrapper}>
                <Text style={styles.streakDays}>{currentStreak} </Text>
                <Text style={styles.streakText}>dagen streak!</Text>
              </View>
            </View>
            <View style={styles.weekdays}>
              {last7Days.map((day, index) => (
                <View key={index} style={styles.day}>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                  {streakData.includes(day.date) ? <CheckIcon /> : <View style={styles.emptyCircle} />}
                </View>
              ))}
            </View>
            <Text style={styles.instruction}>
              Open de app elke dag en ontdek een nieuw gebied om je streak te behouden
            </Text>
          </View>
          <PrimaryButton
            label={'Ga verder met ontdekken'}
            onPress={() => navigation.navigate('Home')}
          />
        </ScrollView>
      </Layout>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distributes space around elements
  },
  headerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
  },
  container: {
    flex: 1,
    backgroundColor: '#127780',
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  streakInfoWrapper: {
   marginLeft: 20,
  },
  streakDays: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: -10,
  },
  streakText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    paddingVertical: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  day: {
    alignItems: 'center',
  },
  dayLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  emptyCircle: {
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: Colors.secondaryGreen,
    marginTop: 5,
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 5,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#127780',
  }
});

export default StreaksScreen;
