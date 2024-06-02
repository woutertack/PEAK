// Ranking.js
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

const Ranking = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('km²');
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
        requester_profile:profiles!requester_id(id, first_name, last_name, avatar_url, total_hexagons, total_distance_km, total_steps),
        requestee_profile:profiles!requestee_id(id, first_name, last_name, avatar_url, total_hexagons, total_distance_km, total_steps)
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

  const sortUsers = (users, category) => {
    if (!users || !users.length) return [];
    return [...users].sort((a, b) => {
      if (category === 'Gebieden') {
        return b.total_hexagons - a.total_hexagons;
      } else if (category === 'km²') {
        return b.total_distance_km - a.total_distance_km;
      } else if (category === 'Stappen') {
        return b.total_steps - a.total_steps;
      }
      return 0;
    });
  };

  const sortedUsers = sortUsers(users, selectedCategory);

  // Find current user and rank
  const currentUser = sortedUsers.find(user => user.id === session.user.id);
  const currentUserRank = sortedUsers.findIndex(user => user.id === session.user.id) + 1;

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
        <Tabs options={['Gebieden', 'km²', 'Stappen']} selectedOption={selectedCategory} setSelectedOption={setSelectedCategory} />
        {/* <Tabs options={['Weekly', 'All Time', 'Monthly']} selectedOption={selectedTimeFrame} setSelectedOption={setSelectedTimeFrame} /> */}
        <View style={styles.leaderboard}>
        {currentUser && (
          <LeaderboardItem
            key={currentUser.id}
            user={{ ...currentUser, rank: currentUserRank }}
            selectedCategory={selectedCategory}
            isCurrentUser
          />
        )}

      
          {sortedUsers.map((user, index) => (
            user.id !== session.user.id && (
              <LeaderboardItem
                key={user.id}
                user={{ ...user, rank: index + 1 }}
                selectedCategory={selectedCategory}
                onPress={() => navigation.navigate('FriendsProfile', { friendId: user.id })}
              />
            )
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
