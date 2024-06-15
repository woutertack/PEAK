import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Layout, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';

import { supabase } from '../lib/initSupabase';
import { AuthContext } from '../provider/AuthProvider';
import CardChallengeCompleted from '../components/cards/CardChallengeCompleted';
import formatChallengeDescription from '../components/utils/challenges/formatChallengeDescription';
import SadIcon from '../components/utils/icons/SadIcon';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';

const CompletedChallenges = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [filter, setFilter] = useState('daily'); // default filter
  const { session } = useContext(AuthContext);
  const userId = session?.user?.id;

  const fetchCompletedChallenges = async (filter) => {
    try {
      if (!userId) {
        throw new Error('User not logged in');
      }

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .eq('type', filter);

      if (error) {
        throw error;
      }

      setCompletedChallenges(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  };

  useEffect(() => {
    fetchCompletedChallenges(filter);
  }, [filter]);

  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedChallenges(filter);
    }, [filter])
  );

  const calculateEndDate = (creationTime, type) => {
    const creationDate = new Date(creationTime);
    switch (type) {
      case 'daily':
        creationDate.setDate(creationDate.getDate() + 1);
        break;
      case 'weekly':
        creationDate.setDate(creationDate.getDate() + 7);
        break;
      case 'monthly':
        creationDate.setMonth(creationDate.getMonth() + 1);
        break;
      default:
        break;
    }
    return creationDate;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Layout>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
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
          <Text style={styles.headerText}>Voltooid</Text>
          <View style={styles.iconPlaceholder} />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'daily' && styles.filterButtonActive]}
            onPress={() => setFilter('daily')}
          >
            <Text style={styles.filterButtonText}>Dagelijks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'weekly' && styles.filterButtonActive]}
            onPress={() => setFilter('weekly')}
          >
            <Text style={styles.filterButtonText}>Wekelijks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'monthly' && styles.filterButtonActive]}
            onPress={() => setFilter('monthly')}
          >
            <Text style={styles.filterButtonText}>Maandelijks</Text>
          </TouchableOpacity>
        </View>

        {completedChallenges.length === 0 ? (
          <>
          <Text style={styles.noChallengesText}>
          U heeft nog geen {filter === 'daily' ? 'dagelijkse' : filter === 'weekly' ? 'wekelijkse' : 'maandelijkse'} uitdagingen voltooid, zit niet stil en probeer er vandaag nog te voltooien !
          </Text>
          <SecondaryButton
              label={`Bekijk uw uitdagingen`}
              onPress={() => navigation.navigate('Challenges')}
            />
            
          
          </>
        ) : (
        completedChallenges.map((challenge) => (
          <CardChallengeCompleted
            key={challenge.id}
        
            progress={1} // Completed challenges have 100% progress
            description={formatChallengeDescription(challenge.challenge_type, challenge.goal)}
            initialTimeLeft={formatDate(calculateEndDate(challenge.creation_time, challenge.type))} // Format the calculated end date
            type={challenge.type}
            creationTime={challenge.creation_time}
    
          />
        )))}
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    margin: 0,
    borderRadius: 5,
    backgroundColor: Colors.lightGreen,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryGreen,
  },
  filterButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  noChallengesText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 13,
    marginHorizontal: 0
  },
});

export default CompletedChallenges;
