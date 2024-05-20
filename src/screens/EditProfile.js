import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, TextInput, Text } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import { AuthContext } from '../provider/AuthProvider';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '../lib/initSupabase';
import AvatarUpload from '../components/AvatarUpload';

const EditProfile = ({navigation}) => {
  const { session } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, avatar_url, created_at`)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAvatarUrl(data.avatar_url);
        setCreatedAt(data.created_at);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ firstName, lastName, avatar_url }) {
    try {
      setLoading(true);

      const updates = {
        id: session?.user.id,
        first_name: firstName,
        last_name: lastName,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates, { returning: 'minimal' });

      if (error) {
        throw error;
      }

      Alert.alert('Success', 'Profile updated successfully!');
      navigation.navigate('Profile');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TabBarIcon
              library="AntDesign"
              icon="arrowleft"
              size={38}
              style={styles.icon}
              onPress={() => {
                navigation.navigate('Profile');
              }}
            />
            <Text style={styles.headerText}>Edit Profile</Text>
            <TabBarIcon
              library="Ionicons"
              icon="settings-sharp"
              size={32}
              style={styles.settingsIcon}
              onPress={() => {
                navigation.navigate('Settings');
              }}
            />
          </View>
          {/* TO DO: make avatar load in faster */}
          <View style={styles.profileContainer}>
            <View style={styles.profileImg}>
            <AvatarUpload
              size={180}
              url={avatarUrl}
              onUpload={(url) => {
                setAvatarUrl(url)
               
              }}
            />
             
            </View>
            <Text style={{ marginTop: 20, color: Colors.white, fontSize: 18 }}>Voornaam</Text>
            <TextInput
              containerStyle={{ marginTop: 5 }}
              placeholder="Voornaam"
              value={firstName}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              onChangeText={(text) => setFirstName(text)}
            />
            <Text style={{ marginTop: 20, color: Colors.white, fontSize: 18 }}>Achternaam</Text>
            <TextInput
              containerStyle={{ marginTop: 5, marginBottom: 40 }}
              placeholder="Achternaam"
              value={lastName}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              onChangeText={(text) => setLastName(text)}
            />
          </View>
          <View style={styles.updateBtn}>
            <PrimaryButton
              label={loading ? 'Loading ...' : 'Update'}
              onPress={() => updateProfile({ firstName, lastName, avatar_url: avatarUrl })}
              disabled={loading}
            />
          </View>
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
    flexGrow: 1,
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
  settingsIcon: {
    marginLeft: 'auto',
    color: '#fff',
  },
  profileContainer: {
    alignItems: 'start',
    marginTop: 40,
  },
  avatar: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default EditProfile;
