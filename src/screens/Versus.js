import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import Avatar from '../components/Avatar';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import useStatusBar from '../helpers/useStatusBar';
import HistoryIcon from '../components/utils/icons/HistoryIcon';
import { supabase } from '../lib/initSupabase';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TrophyIcon from '../components/utils/icons/TrophyIcon';
import { AuthContext } from '../provider/AuthProvider';
import calculateTime from '../components/utils/versus/calculateTime';
import TimerIcon from '../components/utils/icons/TimerIcon';

const Versus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { session } = useContext(AuthContext);
  const userId = session?.user.id; 
  
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabase
        .from('versus')
        .select(`
          id, goal, challenge_type, accepted_time, status, deadline,
          creator_progress, friend_progress,
          creator:creator_id (id, first_name, last_name),
          friend:friend_id (id, first_name, last_name)
        `)
        .eq('status', 'accepted');

      if (error) {
        Alert.alert('Error fetching challenges', error.message);
      } else {
        // Sort challenges to ensure your stats are first
        const sortedChallenges = data.map(challenge => {
          console.log('ss', challenge.creator.id);
          if (challenge.creator.id === userId) {
            return { ...challenge, creator_is_user: true };
          } else if (challenge.friend.id === userId) {
            return { ...challenge, creator_is_user: false };
          } else {
            return challenge;
          }
        }).sort((a, b) => {
          if (a.creator_is_user) return -1;
          if (b.creator_is_user) return 1;
          return 0;
        });

        setChallenges(sortedChallenges);
       
      }
    };

    fetchChallenges();
  }, []);

  const isFriend = (challenge) => challenge.friend.id === session.user.id;

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
              style={styles.iconBack}
              onPress={() => {
                navigation.navigate('Home');
              }}
            />
            <Text style={styles.headerText}>Versus</Text>
            <TouchableOpacity onPress={() => Alert.alert('Coming soon!')}>
              <HistoryIcon style={styles.iconPlaceholder} />
            </TouchableOpacity>
          </View>
          <PrimaryButton
            label="Accepteer uitdaging"
            onPress={() => navigation.navigate('AcceptVersus')}
          />

          {challenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeContainer}>
              <View style={styles.goalContainer}>
                <TrophyIcon/>
                <Text style={styles.challengeGoal}>{challenge.goal} {challenge.challenge_type === 'steps' ? 'stappen' : challenge.challenge_type}</Text>
                <TimerIcon/>
                <Text style={styles.timeLeft}>{calculateTime( challenge.deadline)}</Text>
              </View>
              <View style={[styles.progressContainer, isFriend(challenge) ? styles.rowReverse : null]}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>
                    {challenge.creator_is_user ? 'uw score' : `${challenge.creator.first_name} ${challenge.creator.last_name}`}
                  </Text>
                  <AnimatedCircularProgress
                    size={80}
                    width={10}
                    fill={Math.min(challenge.creator_progress * 100 / challenge.goal, 100)}
                    tintColor={Colors.primaryGreen}
                    backgroundColor={Colors.white}
                    arcSweepAngle={280}
                    rotation={220}
                    lineCap={'round'}
                  >
                    {
                      (fill) => (
                        <Text style={styles.progressPercent}>
                          {fill.toFixed(0)}%
                        </Text>
                      )
                    }
                  </AnimatedCircularProgress>
                  <Text style={styles.progressSteps}>{challenge.creator_progress}/{challenge.goal} </Text>
                </View>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>
                    {challenge.creator_is_user ? `${challenge.friend.first_name} ${challenge.friend.last_name}` : 'uw score'}
                
                  </Text>
                  <AnimatedCircularProgress
                    size={80}
                    width={10}
                    fill={Math.min(challenge.friend_progress * 100 / challenge.goal, 100)}
                    tintColor={Colors.primaryGreen}
                    backgroundColor={Colors.white}
                    arcSweepAngle={280}
                    rotation={220}
                    lineCap={'round'}
                  >
                    {
                      (fill) => (
                        <Text style={styles.progressPercent}>
                          {fill.toFixed(0)}%
                        </Text>
                      )
                    }
                  </AnimatedCircularProgress>
                  <Text style={styles.progressSteps}>{challenge.friend_progress}/{challenge.goal} </Text>
                </View>
              </View>
            </View>
          ))}

        </ScrollView>
        <TouchableOpacity onPress={() => navigation.navigate('CreateVersus')}>
          <View style={styles.addButton}>
            <TabBarIcon
              library="AntDesign"
              icon="plus"
              size={38}
              style={styles.icon}
              onPress={() => {
                navigation.navigate('CreateVersus');
              }}
            />
          </View>
        </TouchableOpacity>
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
    paddingBottom: 100, // Make room for the button
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
  icon: {
    color: Colors.secondaryGreen,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 15,
    paddingBottom: 15,
  },
  challengeContainer: {
    padding: 0,
    borderRadius: 10,
    marginVertical: 10,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalContainer: {
    color: '#fff',
    backgroundColor: Colors.darkGreen,
    padding: 7,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    paddingLeft: 15,
    alignContent: 'center',
    alignItems: 'center',
  },
  challengeGoal: {
    paddingLeft: 5,
    fontSize: 18,
    color: Colors.white,
    flex: 1,
  },
  timeLeft: {
    color: Colors.white,
    fontSize: 14,
    marginLeft: 5,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  progressItem: {
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '50%',
    minWidth: '45%',
  },
  progressLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 4,
    alignContent: 'center',
    textAlign: 'center',
  },
  progressSteps: {
    color: '#fff',
    marginTop: 5,
    fontSize: 16,
  },
});

export default Versus;
