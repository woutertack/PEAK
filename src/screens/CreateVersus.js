import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert } from 'react-native';
import { Layout, Text, TextInput } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import TabBarIcon from '../components/utils/TabBarIcon';
import Colors from '../consts/Colors';
import useStatusBar from '../helpers/useStatusBar';
import { supabase } from '../lib/initSupabase';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../provider/AuthProvider';
import { useRoute } from '@react-navigation/native';

const CreateVersus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');
  const { session } = useContext(AuthContext);
  const route = useRoute();

  const [challengeType, setChallengeType] = useState('steps');
  const [goal, setGoal] = useState('');
  const [timeslotDate, setTimeslotDate] = useState(new Date());
  const [timeslotTime, setTimeslotTime] = useState(new Date());
  const [friendId, setFriendId] = useState(route.params?.friendId || ''); // Set initial state from route params
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      const userId = session?.user.id;

      const { data, error } = await supabase
        .from('friend_requests')
        .select('requester_id, requestee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},requestee_id.eq.${userId}`);

      if (error) {
        Alert.alert('Error fetching friends', error.message);
        return;
      }

      const friendIds = data.map((request) =>
        request.requester_id === userId ? request.requestee_id : request.requester_id
      );

      if (friendIds.length > 0) {
        const { data: friendsData, error: friendsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', friendIds);

        if (friendsError) {
          Alert.alert('Error fetching friends profiles', friendsError.message);
        } else {
          setFriends(friendsData);
        }
      } else {
        setFriends([]);
      }
    };

    fetchFriends();
  }, []);

  const handleDateConfirm = (event, selectedDate) => {
    if (selectedDate) {
      setTimeslotDate(selectedDate);
    }
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (event, selectedTime) => {
    if (selectedTime) {
      setTimeslotTime(selectedTime);
    }
    setTimePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const validateForm = () => {
    if (!goal) {
      Alert.alert('Geen geldige gegevens', 'Geef een goal in!');
      return false;
    }

    if (!challengeType) {
      Alert.alert('Geen geldige gegevens', 'Geef een uitdagins type mee.');
      return false;
    }
    if (!friendId) {
      Alert.alert('Geen geldige gegevens', 'Selecteer een vriend!');
      return false;
    }
    const combinedTimeslot = new Date(
      timeslotDate.getFullYear(),
      timeslotDate.getMonth(),
      timeslotDate.getDate(),
      timeslotTime.getHours(),
      timeslotTime.getMinutes(),
      timeslotTime.getSeconds()
    );
    if (combinedTimeslot <= new Date()) {
      Alert.alert('Geen geldige gegevens', 'Selecteer een tijd in de toekomst!');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Combine date and time into a single Date object
    const combinedTimeslot = new Date(
      timeslotDate.getFullYear(),
      timeslotDate.getMonth(),
      timeslotDate.getDate(),
      timeslotTime.getHours(),
      timeslotTime.getMinutes(),
      timeslotTime.getSeconds()
    );
    console.log(combinedTimeslot);
  
    const newChallenge = {
      creator_id: session?.user.id,
      friend_id: friendId,
      challenge_type: challengeType,
      goal: goal ? parseInt(goal) : null,
      deadline: combinedTimeslot,
    };

    const { error } = await supabase.from('versus').insert([newChallenge]);

    if (error) {
      Alert.alert('Error creating challenge', error.message);
    } else {
      Alert.alert('Uitdaging aangemaakt!', 'Je uitdaging zal starten wanneer je vriend deze accepteert.');
      navigation.goBack();
    }

    setLoading(false);
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
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerText}>Maak uitdaging</Text>
            <View style={styles.iconPlaceholder}></View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Uitdaging Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={challengeType}
                onValueChange={(value) => setChallengeType(value)}
                style={styles.picker}
              >
                <Picker.Item label="Stappen" value="steps" />
                <Picker.Item label="Afstand" value="distance" />
                <Picker.Item label="Gebieden" value="hexagons" />
              </Picker>
            </View>
          </View>


          <View style={styles.formGroup}>
            <Text style={styles.label}>Goal
              <Text style={{fontSize: 12, color: Colors.white, margin: '8'}}></Text>
            </Text>
            <TextInput
              value={goal}
              onChangeText={(value) => setGoal(value)}
              keyboardType="numeric"
              style={styles.TextInput}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kies hoelang je uitdaging loopt</Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 5 }}>
              <TouchableOpacity onPress={showDatePicker}>
                <View style={styles.datumWrapper}>
                  <Text style={styles.datumTitle}>
                    Datum
                  </Text>
                  <Text style={styles.datePicker}>
                    {timeslotDate.toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
              {isDatePickerVisible && (
                <DateTimePicker
                  value={timeslotDate}
                  mode="date"
                  display="default"
                  onChange={handleDateConfirm}
                />
              )}
              <TouchableOpacity onPress={showTimePicker}>
                <View style={styles.datumWrapper}>
                  <Text style={styles.datumTitle}>
                    Tijd
                  </Text>
                  <Text style={styles.datePicker}>
                    {timeslotTime.toLocaleTimeString()}
                  </Text>
                </View>
              </TouchableOpacity>
              {isTimePickerVisible && (
                <DateTimePicker
                  value={timeslotTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeConfirm}
                />
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kies een vriend</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={friendId}
                onValueChange={(value) => setFriendId(value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecteer een vriend" value="" />
                {friends.map(friend => (
                  <Picker.Item key={friend.id} label={`${friend.first_name} ${friend.last_name}`} value={friend.id} />
                ))}
              </Picker>
            </View>
          </View>

        </ScrollView>

        <View style={styles.createBtn}>
          <PrimaryButton    
            label={loading ? 'Creëren...' : 'Creëer uitdaging'}
            onPress={handleSubmit}
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
    width: 38,
    height: 38,
  },
  formGroup: {
    marginVertical: 10,
    marginTop: 10,
    overflow: 'hidden'
  },
  label: {
    marginBottom: 5,
    color: '#fff',
    fontSize: 16,
  },
  datePicker: {
    color: '#000',
    padding: 10,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  datumWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    textAlign: 'center',
  },
  datumTitle: {
    color: '#fff',
    marginTop: -10,
    marginRight: 10,
  },
  createBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    color: '#000',
  },
  TextInput:{
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
  }
});

export default CreateVersus;
