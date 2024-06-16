import React, { useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Dimensions } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/initSupabase";
import { Layout, Text } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../consts/Colors";
import Map from "../components/map/Map";
import Target from "../components/utils/icons/Target";
import User from "../components/utils/icons/User";
import FriendsIcon from "../components/utils/icons/FriendsIcon";
import StreakIcon from "../components/utils/icons/StreakIcon";
import IconStreakModal from "../components/utils/icons/IconStreakModal"
import { AuthContext } from "../provider/AuthProvider";
import { calculateStreak } from '../components/utils/streaks/CalculateStreak'; 
import useStatusBar from "../helpers/useStatusBar";
import { useHealthConnect } from "../provider/HealthConnectProvider";
import DailyChallengeCard from "../components/cards/DailyChallengeCard";
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { tutorialTexts } from "./../components/utils/TutorialTexts"; 
// import { requestNotificationsPermissions } from './../helpers/notifications'; // Import notifications
import PrimaryButton from "../components/utils/buttons/PrimaryButton";

import { usePushNotifications } from "../helpers/usePushNotifications";

const { height, width } = Dimensions.get('window');

export default function ({ navigation }) {
  const { session } = useContext(AuthContext);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(0);


  const [showAnimation, setShowAnimation] = useState(false); // State to show the animation
  const [showTutorial, setShowTutorial] = useState(false); 
  const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0);
  const animation = useRef(null);  // Ref for the animation
  const { readHealthData } = useHealthConnect();

  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);

  useEffect(() => {
    if (notification) {
      // Handle the notification when received
      console.log(
        notification.request.content.title,
        notification.request.content.body
      );
    }
  }, [notification]);

  console.log(expoPushToken?.data ?? "No token")
  // console.log(data)

  

  const getFirstLogin = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tutorial_seen')
      .eq('id', session?.user.id)
      .single();

    if (error) {
      console.error('Error fetching tutorial_seen status:', error);
      return;
    }

    if (data) {
      setShowTutorial(!data.tutorial_seen);
    }
  };

  const updateTutorial = async () => {
    const { data, error } = await supabase
    .from('profiles')
    .update({tutorial_seen: true})
    .eq('id', session.user.id)

  if (error) {
    console.error('Error fetching tutorial_seen status:', error);
    return;
  }
  }

  useEffect(() => {
    getFirstLogin();

  }, []);

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
   
  
      // Update profile with total hexagons
      const totalHexagons = data.length;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_hexagons: totalHexagons })
        .eq('id', session.user.id);
  
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    
  };

  const getTotalVisits = async () => {
    const { data, error } = await supabase
    .from('locations')
    .select('visit_times')
    .eq('user_id', session.user.id)
  
    if (error) {
      console.error(error);
      return;
    }
  
    if (data) {
      const streak = calculateStreak(data);
      setCurrentStreak(streak.currentStreak);

      const allVisits = data.flatMap(location => location.visit_times || []);
      const totalVisits = allVisits.length;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ total_visits: totalVisits })
        .eq('id', session.user.id);
  
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    
  };

  const fetchDailyChallenge = async () => {
    try {
      const { data: dailyData, error: dailyError } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('type', 'daily')
        .order('creation_time', { ascending: false })
        .limit(1)
        .single();

      if (dailyError && dailyError.code !== 'PGRST116') {
        throw new Error('Error fetching daily challenge');
      }

      if (dailyData) {

        const creationDate = new Date(dailyData.creation_time);
        const deadline = new Date(creationDate.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        
        const isValid = now <= deadline;
        
        if (isValid) {
          console.log('Today is the same as the creation date');
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
   
    let progress = 0;
    console.log('Challenge:', challenge);

    if (challenge.challenge_type === 'hexagons') {
  
      const { data: hexagons, error } = await supabase
        .from('locations')
        .select('visit_times')
        .eq('user_id', session?.user.id);
        
        if (error) {
          console.error('Error fetching hexagon data:', error);
          return;
        }

    
        // Filter visit_times based on challenge.creation_time
        const validVisits = hexagons.flatMap(location =>
          (location.visit_times || []).filter(visitTime => new Date(visitTime) >= new Date(challenge.creation_time))
        );

        console.log('All visits:', hexagons);
        // console.log('Valid visits:', validVisits);
    
        progress = validVisits.length ;
        console.log('Progress:', progress);
    } else {

      const { totalSteps, totalDistance } = await readHealthData(challenge.creation_time);
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
      console.log('Progress:', progress);
      
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
    
    if (progress >= challenge.goal && !challenge.completed) {
      const { error } = await supabase
        .from('challenges')
        .update({ completed: true })
        .eq('id', challenge.id);

      if (error) {
        console.error('Error updating challenge completion status:', error);
      } else {
        console.log('Challenge marked as completed');
        setShowAnimation(true);  // Show the animation
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await Promise.all([fetchStreakData(), fetchDailyChallenge(), getTotalVisits()]);
      };
      fetchData();
    }, [session?.user.id, readHealthData,])
  );

  useEffect(() => {
    if (showAnimation && animation.current) {
      animation.current.play();
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);  // Adjust the duration based on your animation length
    }
  }, [showAnimation]);

  const nextTutorial = () => {
    if (currentTutorialIndex < tutorialTexts.length - 1) {
      setCurrentTutorialIndex(currentTutorialIndex + 1);
    } else {
      setShowTutorial(false);
      updateTutorial();
    }
  };


  useStatusBar('transparent', 'dark-content');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout>
        <View style={styles.topNavContainer} pointerEvents="box-none">
          <View style={styles.navButtonGroup}>
            <TouchableOpacity style={[styles.profileIcon,  { position: 'absolute', top: height * 0.0036, right: width * 0.001 }]} onPress={() => navigation.navigate("Profile")}>
              <User />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileIcon,  { position: 'absolute', top: height * 0.072, right: width * 0.001 }]} onPress={() => navigation.navigate("Challenges")}>
              <Target />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileIcon,  { position: 'absolute', top: height * 0.1404, right: width * 0.001 }]} onPress={() => navigation.navigate("Friends")}>
              <FriendsIcon />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.streakIcon,  { position: 'absolute', top: height * 0.212, right: width * 0.001 }]} onPress={() => navigation.navigate("Streaks")}>
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
          <TouchableOpacity style={styles.noChallengeContainer} onPress={() => navigation.navigate("Challenges")} activeOpacity={0.9}>
            <Text style={styles.noChallengeText}>Klik hier voor nieuwe uitdaging</Text>
          </TouchableOpacity>
        )}
        {showAnimation && (
          <View style={styles.lottieContainer}>
            <LottieView
              autoPlay
              loop={false}
              ref={animation}
              style={styles.lottieAnimation}
              source={require('./../components/utils/animations/confetti.json')}
              speed={0.5}
            />
            <LottieView
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
              source={require('./../components/utils/animations/confetti.json')}
              speed={0.5}
            />
            <LottieView
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
              source={require('./../components/utils/animations/confetti.json')}
              speed={0.5}
            />
          </View>
        )}
        <Modal
          visible={showTutorial}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTutorial(false)}
        >
          <View style={styles.tutorialContainer}>
            {currentTutorialIndex == 3 && (
              <TouchableOpacity style={[styles.profileIconModal, { top: height * 0.030, right: width * 0.055 }]} pointerEvents="none">
                <User />
              </TouchableOpacity>
            )}
            {currentTutorialIndex == 4 && (
              <TouchableOpacity style={[styles.profileIconModal, { top: height * 0.098, right: width * 0.055 }]} pointerEvents="none">
                <Target />
              </TouchableOpacity>
            )}
            {currentTutorialIndex == 5 && (
              <TouchableOpacity style={[styles.profileIconModal, { top: height * 0.167, right: width * 0.055 }]} pointerEvents="none">
                <FriendsIcon />
              </TouchableOpacity>
            )}
            {currentTutorialIndex == 6 && (
              <TouchableOpacity style={[styles.streakIconModal, { top: height * 0.2385, right: width * 0.055 }]} pointerEvents="none">
                <IconStreakModal />
              </TouchableOpacity>
            )}
            <View style={styles.tutorialBox}>
              <Text style={styles.tutorialTitle}>
                {currentTutorialIndex == 7 ? 'Einde' : 'Hoe werkt het'}
              </Text>
              <Text style={styles.tutorialText}>{tutorialTexts[currentTutorialIndex].text}</Text>
              <Text style={styles.tutorialProgress}>
                {currentTutorialIndex + 1} / {tutorialTexts.length}
              </Text>
              <TouchableOpacity style={styles.nextButton} onPress={nextTutorial}>
                <Text style={styles.nextButtonText}>Volgende</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'flex-end',
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
    width: '100%',
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
    fontSize: 16,
    color: Colors.secondaryGreen,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  underlineInside: {
    left: 0,
    height: 3,
    backgroundColor: Colors.secondaryGreen,
    marginBottom: 10,
  },
  lottieContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  lottieAnimation: {
    width: '100%',
    height: '40%',
    backgroundColor: 'transparent',
  },
  tutorialContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
  },
  tutorialBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    maxWidth: 350,
    justifyContent: 'space-between',
    height: '42%',
    width: '75%',
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.secondaryGreen,
  },
  tutorialText: {
    textAlign: 'center',
    color: Colors.secondaryGreen,
    marginHorizontal: 0,
    fontSize: 18,
    marginBottom: 10,
  },
  nextButton: {
    padding: 4,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: Colors.secondaryGreen,
    borderRadius: 15,
    marginTop: 0,
  },
  nextButtonText: {
    color: Colors.secondaryGreen,
  },
  tutorialProgress: {
    color: Colors.secondaryGreen,
    fontWeight: 'bold',
    marginTop: 15,
  },
  profileIconModal: {
    backgroundColor: Colors.secondaryGreen,
    borderRadius: 12,
    borderColor: Colors.primaryGreen,
    borderWidth: 1.5,
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
    position: 'absolute',
  },
  streakIconModal: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    width: 45,
    height: 42,
    position: 'absolute',
  },
});