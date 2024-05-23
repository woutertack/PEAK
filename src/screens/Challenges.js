import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import CardChallenge from '../components/cards/CardChallenge';

const Challenges = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const [loading, setLoading] = useState(false);
  const [incomingChallenges, setIncomingChallenges] = useState([
    {
      id: 1,
      title: 'Dagelijkse uitdaging',
      progress: 0.27,
      description: '12500 stappen',
      timeLeft: '12:05:20',
    },
    {
      id: 2,
      title: 'Wekelijkse uitdaging',
      progress: 0.36,
      description: 'Ontdek 11 nieuwe gebieden',
      timeLeft: '5 dagen ',
    },
    {
      id: 3,
      title: 'Maandelijkse uitdaging',
      progress: 0.27,
      description: '12500 stappen',
      timeLeft: '14 dagen',
    },
  ]);

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
          {incomingChallenges.map((challenge) => (
            <CardChallenge
              key={challenge.id}
              title={challenge.title}
              progress={challenge.progress}
              description={challenge.description}
              timeLeft={challenge.timeLeft}
            />
          ))}
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
    marginBottom: 20
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
});

export default Challenges;
