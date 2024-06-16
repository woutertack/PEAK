import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import { supabase } from '../lib/initSupabase';
import TabBarIcon from '../components/utils/TabBarIcon';
import { AuthContext } from '../provider/AuthProvider';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import Avatar from '../components/Avatar';
import formatChallengeDescription from '../components/utils/challenges/formatChallengeDescription'

const AcceptVersus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { session } = useContext(AuthContext);
  const userId = session.user.id;
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(session?.user?.user_metadata.first_name);
  const [lastName, setLastName] = useState(session?.user?.user_metadata.last_name);

  

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('versus')
        .select(`
          id, goal, challenge_type, deadline, status, 
          creator:creator_id (id, first_name, last_name, avatar_url)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending')
        .gt('deadline', new Date().toISOString());

      if (error) {
        Alert.alert('Error fetching challenges', error.message);
      } else {
        setChallenges(data);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  const handleResponse = async (challengeId, response) => {
    setLoading(true);
    const updateData = { status: response };
    if (response === 'accepted') {
      updateData.accepted_time = new Date().toISOString();
    }
    const { error } = await supabase
      .from('versus')
      .update(updateData)
      .eq('id', challengeId);

    if (error) {
      Alert.alert('Error updating challenge status', error.message);
    } else {
      if (response === 'accepted') {
        // Fetch the creator's expo_push_token
        const { data: challengeData, error: challengeError } = await supabase
          .from('versus')
          .select(`
            creator:creator_id (expo_push_token)
          `)
          .eq('id', challengeId)
          .single();

        if (challengeError) {
          console.error(challengeError);
        } else {
          const message = {
            to: challengeData.creator.expo_push_token,
            channel: 'default',
            title: 'Een uitdaging van u is geaccepteerd!',
            body: `${firstName} ${lastName} heeft uw uitdaging geaccepteerd, de uitdaging is nu begonnen!`,
          };
          console.log('Sending push notification:', message);


          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });
        }
      }
      setChallenges(challenges.filter(challenge => challenge.id !== challengeId));
    }
    setLoading(false);
  };


  return (
    <Layout style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
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
            <Text style={styles.headerText}>Uitnodigingen</Text>
              <View style={styles.iconPlaceholder} />
          </View>
        {challenges.length === 0 ? (
          <Text style={styles.noChallengesText}>Geen uitnodigingen op dit moment</Text>
        ) : (
          challenges.map((challenge) => (
            <View key={challenge.id} style={styles.incomingChallenge}>
              <View style={styles.avatar} pointerEvents="none">
                <Avatar url={challenge.creator.avatar_url} size={50}  />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeText}>{`${challenge.creator.first_name} ${challenge.creator.last_name} heeft je uitgedaagd`}</Text>
                <Text style={styles.challengeSubtitle}>{formatChallengeDescription(challenge.challenge_type, challenge.goal)}</Text>
                <View style={styles.buttonsContainer}>
                  <SecondaryButton label="Accepteer" onPress={() => handleResponse(challenge.id, 'accepted')} style={styles.acceptButton} />
                  <TertiaryButton label="Weiger" onPress={() => handleResponse(challenge.id, 'declined')} style={styles.declineButton} />
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </Layout>
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
  noChallengesText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  challengeContainer: {
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  challengeGoal: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  incomingChallenge: {
    flexDirection: 'row',
    marginBottom: 0,
    marginTop: 20,
  },
  avatar: {
    width: 50,
    height: 70,
    borderRadius: 50,
    marginRight: 20,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  challengeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '45%',
    marginTop: 10,
    gap: 10,
  },
  acceptButton: {},
  declineButton: {},
  updateBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default AcceptVersus;
