// components/TopThree.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '../../consts/Colors';
import PlaceIcon from '../utils/icons/PlaceIcon'; // Assuming you have this component
import Avatar from '../Avatar';

const TopThree = ({ users, selectedCategory }) => {
  
  const getDisplayedValue = (user) => {
    switch (selectedCategory) {
      case 'Gebieden':
        return user.total_hexagons;
      case 'Afstand':
        return `${user.total_distance_km} km`;
      case 'Stappen':
        return user.total_steps;
      default:
        return 0;
    }
  };

  return (
    <View style={styles.topThreeContainer}>
      {users.map((user, index) => (
        <View
          key={user.id}
          style={[
            styles.userContainer,
            index === 0 && styles.firstPlace,
            index === 1 && styles.secondPlace,
            index === 2 && styles.thirdPlace
          ]}
        >
          <View style={styles.avatar}>
            <Avatar url={user.avatar_url} size={70} />
          </View>
          <View style={styles.place}>
            <PlaceIcon place={index + 1} />
          </View>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.points}>{getDisplayedValue(user)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 35,
  },
  userContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  firstPlace: {
    marginHorizontal: 20, // Add margin to center it within the container
    zIndex: 1, // Ensure the first place is above the others
  },
  secondPlace: {
    position: 'absolute',
    left: 0,
    transform: [{ translateY: 15 }],
  },
  thirdPlace: {
    position: 'absolute',
    right: 0,
   
    transform: [{ translateY: 25 }],
  },
  avatar: {
    zIndex: 1,
  },
  place: {
    bottom: 18.7,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    maxWidth: 100,
  },
  points: {
    color: '#fff',
    fontSize: 12,
  },
});

export default TopThree;
