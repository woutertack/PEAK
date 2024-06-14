import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import { supabase } from '../lib/initSupabase';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TrophyIcon from '../components/utils/icons/TrophyIcon';
import { AuthContext } from '../provider/AuthProvider';
import calculateTime from '../components/utils/versus/calculateTime';
import TimerIcon from '../components/utils/icons/TimerIcon';
import useStatusBar from '../helpers/useStatusBar';
import getChallengeTypeText from '../components/utils/getChallengeTypeText';
import LottieView from 'lottie-react-native';

import SadIcon from '../components/utils/icons/SadIcon';



const HistoryVersus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { session } = useContext(AuthContext);
  const userId = session?.user.id; 

  const animationRef = useRef(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabase
        .from('versus')
        .select(`
          id, goal, challenge_type, accepted_time, status, deadline, winner,
          creator_progress, friend_progress,
          creator:creator_id (id, first_name, last_name),
          friend:friend_id (id, first_name, last_name)
        `)
        .or('winner.not.is.null,deadline.lte.' + new Date().toISOString())
        .or(`creator_id.eq.${userId},friend_id.eq.${userId}`) ;

      if (error) {
        Alert.alert('Error fetching challenges', error.message);
      } else {
        setChallenges(data);
      }
    };

    fetchChallenges();
  }, []);

  const isCreator = (challenge) => challenge.creator.id === userId;
  const isWinner = (userId, challenge) => challenge.winner === userId;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  const handleAnimationFinish = () => {
    if (animationRef.current) {
      animationRef.current.reset();
      animationRef.current.play();
    }
  };

 

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
                navigation.goBack();
              }}
            />
            <Text style={styles.headerText}>Geschiedenis</Text>
            <View style={styles.iconPlaceholder} />
          </View>

          {challenges.map((challenge, index) => (
            <View key={challenge.id} style={styles.challengeContainer}>
              <View style={styles.goalContainer}>
                <TrophyIcon />
                <Text style={styles.challengeGoal}>{challenge.goal} {getChallengeTypeText(challenge.challenge_type)}</Text>
                <Text style={styles.deadline}>{formatDate(challenge.deadline)}</Text>
              </View>
              <View style={[styles.progressContainer, isCreator(challenge) ? null : styles.rowReverse]}>
                <View style={[styles.progressItem, isWinner(challenge.creator.id, challenge) && styles.winnerBorder]}>
                  <Text style={styles.progressLabel}>
                    {isCreator(challenge) ? 'Uw score' : `${challenge.creator.first_name} ${challenge.creator.last_name}`}
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
                <View style={[styles.progressItem, isWinner(challenge.friend.id, challenge) && styles.winnerBorder]}>
                  <Text style={styles.progressLabel}>
                    {isCreator(challenge) ? `${challenge.friend.first_name} ${challenge.friend.last_name}` : 'Uw score'}
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

          {challenges.length === 0 && ( 
            <View style={styles.animation}>
              <SadIcon />

              </View>
         
           )} 

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
    paddingBottom: 100, // Make room for the button
    flexGrow: 1,
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
  winnerBorder: {
    borderColor: '#d4af37', // Gold border for the winner
    borderWidth: 3,
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
  deadline:{
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
    alignContent: 'center',
    alignItems: 'center',
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
    marginBottom: 10,
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
  animation: {
  
    flex: 1,
  
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default HistoryVersus;
