import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, ProgressBarAndroid, Alert, Image } from 'react-native';
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

const Versus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const [loading, setLoading] = useState(false);
  const [incomingChallenges, setIncomingChallenges] = useState([
    {
      id: 1,
      friendName: 'Wouter Tack',
      friendAvatar: '1715979997164.jpeg',
      challengeText: 'Wandel 10 000 stappen',
    },
    {
      id: 2,
      friendName: 'Jan Jansen',
      friendAvatar: 'https://your-friend-avatar-url.com/avatar2.jpg',
      challengeText: 'Ontdek 3 nieuwe gebieden',
    },
  ]);

  const acceptChallenge = (id) => {
    // Your logic to accept the challenge
    Alert.alert('Challenge accepted!');
    // Remove the accepted challenge from the list
    setIncomingChallenges((prevChallenges) => prevChallenges.filter(challenge => challenge.id !== id));
  };

  const declineChallenge = (id) => {
    // Your logic to decline the challenge
    Alert.alert('Challenge declined!');
    // Remove the declined challenge from the list
    setIncomingChallenges((prevChallenges) => prevChallenges.filter(challenge => challenge.id !== id));
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
              style={styles.icon}
              onPress={() => {
                navigation.navigate('Home');
              }}
            />
            <Text style={styles.headerText}>Versus</Text>
            <View style={styles.iconPlaceholder} />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dagelijkse uitdagingen</Text>
            <View style={styles.challenge}>
              <Text style={styles.challengeTitle}>Wandel 10 000 stappen</Text>
              <Text style={styles.challengeSubtitle}>4575 stappen</Text>
              <ProgressBarAndroid styleAttr="Horizontal" color={Colors.primaryGreen} indeterminate={false} progress={0.4575} />
            </View>
            <View style={styles.challenge}>
              <Text style={styles.challengeTitle}>Ontdek 3 nieuwe gebieden</Text>
              <Text style={styles.challengeSubtitle}>1 ontdekt</Text>
              <ProgressBarAndroid styleAttr="Horizontal" color={Colors.primaryGreen} indeterminate={false} progress={1 / 3} />
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wekelijkse uitdagingen</Text>
            <View style={styles.challenge}>
              <Text style={styles.challengeTitle}>Wandel 10 000 stappen</Text>
              <Text style={styles.challengeSubtitle}>4575 stappen</Text>
              <ProgressBarAndroid styleAttr="Horizontal" color={Colors.primaryGreen} indeterminate={false} progress={0.4575} />
            </View>
            <View style={styles.challenge}>
              <Text style={styles.challengeTitle}>Ontdek 3 nieuwe gebieden</Text>
              <Text style={styles.challengeSubtitle}>1 ontdekt</Text>
              <ProgressBarAndroid styleAttr="Horizontal" color={Colors.primaryGreen} indeterminate={false} progress={1 / 3} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accepteer uitdagingen</Text>
            {incomingChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.incomingChallenge}>
                <View style={styles.avatar} pointerEvents="none">
                  <Avatar url={challenge.friendAvatar} size={50}  />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={styles.challengeText}>{`${challenge.friendName} heeft je uitgedaagd`}</Text>
                  <Text style={styles.challengeSubtitle}>{challenge.challengeText}</Text>
                  <View style={styles.buttonsContainer}>
                    <SecondaryButton label="Accepteer" onPress={() => acceptChallenge(challenge.id)} style={styles.acceptButton} />
                    <TertiaryButton label="Weiger" onPress={() => declineChallenge(challenge.id)} style={styles.declineButton} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.updateBtn}>
          <PrimaryButton
            label={loading ? 'Loading ...' : 'Creëer een uitdaging'}
            onPress={() => {
              setLoading(true);
              // Your create challenge logic here
              setLoading(false);
            }}
            disabled={loading}
          />
        </View>
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
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  challenge: {
    marginBottom: 10,
  },
  challengeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  incomingChallenge: {
    flexDirection: 'row',
    marginBottom: 20,
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
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
  },
});

export default Versus;
