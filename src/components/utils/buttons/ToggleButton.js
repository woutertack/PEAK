// components/Toggle.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../../consts/Colors';

const ToggleButton = ({ selectedOption, setSelectedOption }) => {
  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          selectedOption === 'Friends' && styles.activeToggle,
          styles.leftToggle,
          selectedOption === 'Friends' && styles.activeLeftToggle
        ]}
        onPress={() => setSelectedOption('Friends')}
      >
        <Text style={[styles.toggleText, selectedOption === 'Friends' && styles.activeToggleText]}>
          Vrienden
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          selectedOption === 'All' && styles.activeToggle,
          styles.rightToggle,
          selectedOption === 'All' && styles.activeRightToggle
        ]}
        onPress={() => setSelectedOption('All')}
      >
        <Text style={[styles.toggleText, selectedOption === 'All' && styles.activeToggleText]}>
          All
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryGreen,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  toggleButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  leftToggle: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  rightToggle: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  toggleText: {
    color: '#fff',
    fontSize: 13,
  },
  activeToggle: {
    backgroundColor: '#fff',
  },
  activeToggleText: {
    color: Colors.secondaryGreen,
  },
  activeLeftToggle: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  activeRightToggle: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default ToggleButton;
