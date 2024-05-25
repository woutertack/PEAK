import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import { supabase } from '../lib/initSupabase';
import TabBarIcon from '../components/utils/TabBarIcon';
import { AuthContext } from '../provider/AuthProvider';

const AcceptVersus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { session } = useContext(AuthContext);
  const userId = session.user.id;
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('versus')
        .select(`
          id, goal, challenge_type, deadline, status, 
          creator:creator_id (id, first_name, last_name)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

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
      Alert.alert('Success', `Challenge ${response}`);
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
                navigation.navigate('Home');
              }}
            />
            <Text style={styles.headerText}>Versus</Text>
              <View style={styles.iconPlaceholder} />
          </View>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeContainer}>
            <Text style={styles.challengeTitle}>
              Challenge from {challenge.creator.first_name} {challenge.creator.last_name}
            </Text>
            <Text style={styles.challengeGoal}>{challenge.goal} {challenge.challenge_type === 'steps' ? 'steps' : challenge.challenge_type}</Text>
            <View style={styles.buttonContainer}>
              <Button
                text="Accept"
                onPress={() => handleResponse(challenge.id, 'accepted')}
                style={styles.acceptButton}
                disabled={loading}
              />
              <Button
                text="Decline"
                onPress={() => handleResponse(challenge.id, 'declined')}
                style={styles.declineButton}
                disabled={loading}
              />
            </View>
          </View>
        ))}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#F44336',
  },
});

export default AcceptVersus;
