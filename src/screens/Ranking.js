import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Layout } from 'react-native-rapi-ui';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import ToggleButton from '../components/utils/buttons/ToggleButton';
import LeaderboardItem from '../components/ranking/LeaderboardItem';
import Tabs from '../components/ranking/Tabs';
import { supabase } from '../lib/initSupabase';
import { AuthContext } from '../provider/AuthProvider';
import TopThree from '../components/ranking/TopThree';

const Ranking = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('Afstand');
  const [selectedSubCategory, setSelectedSubCategory] = useState('Alle gebieden');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('All Time');
  const [users, setUsers] = useState([]);
  const { session } = useContext(AuthContext);

  useEffect(() => {
    if (selectedOption === 'All') {
      getAllUsers();
    } else {
      getFriends();
    }
  }, [selectedOption]);

  useEffect(() => {
    // Re-fetch users when subcategory changes for 'Gebieden'
    if (selectedCategory === 'Gebieden') {
      if (selectedOption === 'All') {
        getAllUsers();
      } else {
        getFriends();
      }
    }
  }, [selectedCategory, selectedSubCategory]);

  const getAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.log(error.message);
    } else {
      setUsers(data ?? []);
    }
  };

  const getFriends = async () => {
    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        requester_id,
        requestee_id,
        requester_profile:profiles!requester_id(id, first_name, last_name, avatar_url, total_hexagons, total_distance_km, total_steps, total_visits),
        requestee_profile:profiles!requestee_id(id, first_name, last_name, avatar_url, total_hexagons, total_distance_km, total_steps, total_visits)
      `)
      .or(`requester_id.eq.${session.user.id},requestee_id.eq.${session.user.id}`)
      .eq('status', 'accepted');
    if (error) {
      console.log(error.message);
    } else {
      const friends = data.map(req => {
        const isRequester = req.requester_id === session.user.id;
        return isRequester ? req.requestee_profile : req.requester_profile;
      });

      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (currentUserError) {
        console.log(currentUserError.message);
      } else {
        friends.push(currentUserData);
      }
      setUsers(friends);
    }
  };

  const sortUsers = (users, category, subCategory) => {
    if (!users || !users.length) return [];
    return [...users].sort((a, b) => {
      if (category === 'Gebieden') {
        if (subCategory === 'Alle gebieden') {
          return b.total_visits - a.total_visits;
        } else {
          return b.total_hexagons - a.total_hexagons;
        }
      } else if (category === 'Afstand') {
        return b.total_distance_km - a.total_distance_km;
      } else if (category === 'Stappen') {
        return b.total_steps - a.total_steps;
      }
      return 0;
    });
  };

  const sortedUsers = sortUsers(users, selectedCategory, selectedSubCategory);

  // Find and separate the current user
  const currentUser = sortedUsers.find(user => user.id === session.user.id);
  const currentUserRank = sortedUsers.findIndex(user => user.id === session.user.id) + 1;
  const otherUsers = sortedUsers.filter(user => user.id !== session.user.id);

  return (
    <Layout>
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
          <ToggleButton selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
        </View>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Ranking</Text>
        </View>
        <TopThree users={sortedUsers.slice(0, 3)} selectedCategory={selectedCategory} />
        <Tabs options={['Gebieden', 'Afstand', 'Stappen']} selectedOption={selectedCategory} setSelectedOption={setSelectedCategory} />
        {selectedCategory === 'Gebieden' && (
          <Tabs options={['Alle gebieden', 'Unieke gebieden']} selectedOption={selectedSubCategory} setSelectedOption={setSelectedSubCategory} />
        )}
        <View style={styles.leaderboard}>
          {currentUser && (
            <LeaderboardItem
              key={currentUser.id}
              user={{ ...currentUser, rank: currentUserRank }}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              isCurrentUser={true}
              onPress={() => navigation.navigate('Profile')}
            />
          )}
          {otherUsers.map((user, index) => (
            <LeaderboardItem
              key={user.id}
              user={{ ...user, rank: index < currentUserRank - 1 ? index + 1 : index + 2 }} // Adjust rank considering the current user
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              isCurrentUser={false}
              onPress={() => navigation.navigate('FriendsProfile', { friendId: user.id })}
            />
          ))}
        </View>
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
  },
  headerTitle: {
    marginTop: 10,
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center'
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center'
  },
  leaderboard: {
    marginTop: 20,
  },
});

export default Ranking;
