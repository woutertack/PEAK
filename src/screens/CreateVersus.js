// File path: CreateVersus.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text, Button, TextInput, Picker } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from '../components/utils/TabBarIcon';
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import { supabase } from '../lib/initSupabase'
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import DatePicker from 'react-native-date-picker';

const CreateVersus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');

  const [challengeType, setChallengeType] = useState('steps');
  const [goal, setGoal] = useState('');
  const [noLimit, setNoLimit] = useState(false);
  const [timeslot, setTimeslot] = useState('');
  const [friendId, setFriendId] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      const { data, error } = await supabase.from('profiles').select('id, first_name, last_name');
      if (error) {
        Alert.alert('Error fetching friends', error.message);
      } else {
        setFriends(data);
      }
    };

    fetchFriends();
  }, []);

  const handleSubmit = async () => {
    if (!friendId) {
      Alert.alert('Error', 'Please select a friend to challenge.');
      return;
    }

    setLoading(true);

    const newChallenge = {
      creator_id: supabase.auth.user().id,
      friend_id: friendId,
      challenge_type: challengeType,
      goal: noLimit ? null : parseInt(goal),
      no_limit: noLimit,
      timeslot: timeslot,
    };

    const { error } = await supabase.from('versus').insert([newChallenge]);

    if (error) {
      Alert.alert('Error creating challenge', error.message);
    } else {
      Alert.alert('Success', 'Challenge created successfully!');
      navigation.goBack();
    }

    setLoading(false);
  };

  
  const handleConfirm = (date) => {
    setTimeslot(date);
    setDatePickerVisibility(false);
  };
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)

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
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerText}>Create Challenge</Text>
            <View style={styles.iconPlaceholder}></View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Challenge Type:</Text>
            <Picker
              items={[
                { label: 'Stappen', value: 'steps' },
                { label: 'Afstand', value: 'distance' },
                { label: 'Gebieden', value: 'hexagons' },
              ]}
              value={challengeType}
              onValueChange={(value) => setChallengeType(value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Goal
              <Text style={{fontSize: 12, color: Colors.white, margin: '8'}}>  (Laat leeg voor om ter meest)</Text>
            </Text>
            <TextInput
              value={goal}
              onChangeText={(value) => setGoal(value)}
              keyboardType="numeric"
              editable={!noLimit}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Timeslot:</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
              <Text style={styles.datePicker}>
                {timeslot ? timeslot.toLocaleString() : 'Select Date & Time'}
              </Text>
            </TouchableOpacity>
            <DatePicker
              modal
              open={isDatePickerVisible}
              date={timeslot}
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
            />
          </View>

          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Goal:</Text>
            <Input
              value={goal}
              onChangeText={(value) => setGoal(value)}
              keyboardType="numeric"
              editable={!noLimit}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>No Limit:</Text>
            <Input
              type="checkbox"
              value={noLimit}
              onValueChange={(value) => setNoLimit(value)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Timeslot:</Text>
            <Input
              value={timeslot}
              onChangeText={(value) => setTimeslot(value)}
              placeholder="e.g. 7 days, 1 month"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Friend:</Text>
            <Picker
              items={friends.map(friend => ({
                label: `${friend.first_name} ${friend.last_name}`,
                value: friend.id
              }))}
              value={friendId}
              onValueChange={(value) => setFriendId(value)}
            />
          </View> */}

         
        </ScrollView>

        <View style={styles.createBtn}>
          <PrimaryButton    
            label={loading ? 'Creating...' : 'Create Challenge'}
            // onPress={handleSubmit}
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
    paddingBottom: 100,
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
    width: 38,
    height: 38,
  },
  formGroup: {
    marginVertical: 10,
    marginTop: 10
  },
  label: {
    marginBottom: 5,
    color: '#fff',
    fontSize: 16,
  },
  createBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default CreateVersus;
