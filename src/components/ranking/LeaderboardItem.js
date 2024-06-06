// components/LeaderboardItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../consts/Colors';
import Avatar from '../Avatar';
import { TouchableOpacity } from 'react-native-gesture-handler';

const LeaderboardItem = ({ user, selectedCategory , isCurrentUser, onPress  }) => {
  let displayedValue;
  switch (selectedCategory) {
    case 'Gebieden':
      displayedValue = user.total_hexagons;
      break;
    case 'km²':
      displayedValue = user.total_distance_km;
      break;
    case 'Stappen':
      displayedValue = user.total_steps;
      break;
    default:
      displayedValue = 0;
  }

  const itemContent = (
    <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUser]}>
      <Text style={styles.rank}>{user.rank}</Text>
      <Avatar url={user.avatar_url} size={50} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.first_name} {user.last_name} {isCurrentUser && '(Jij)'}
        </Text>
      </View>
      <Text style={styles.points}>{displayedValue}</Text>
    </View>
  );

  if (isCurrentUser) {
    return itemContent;
  } else {
    return (
      <TouchableOpacity onPress={onPress}>
        {itemContent}
      </TouchableOpacity>
    );
  }
};
const styles = StyleSheet.create({
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    marginVertical: 5,
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',

  },
  rank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  avatar: {
   paddingTop: 10,
    
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    color: '#fff',
  },
  points: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
});

export default LeaderboardItem;
