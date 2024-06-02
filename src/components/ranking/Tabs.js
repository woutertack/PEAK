// components/Tabs.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../consts/Colors';

const Tabs = ({ options, selectedOption, setSelectedOption }) => {
  return (
    <View style={styles.tabs}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.tab,
            selectedOption === option && styles.activeTab,
            index === 0 && styles.leftTab,
            index === options.length - 1 && styles.rightTab,
            selectedOption === option && index === 0 && styles.activeLeftTab,
            selectedOption === option && index === options.length - 1 && styles.activeRightTab
          ]}
          onPress={() => setSelectedOption(option)}
        >
          <Text style={[styles.tabText, selectedOption === option && styles.activeTabText]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  
    borderRadius: 20,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.secondaryGreen,
    width: '35%',
    alignItems: 'center',
    borderColor: Colors.white,
    borderWidth: 1,
  },
  leftTab: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  rightTab: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  activeTab: {
    backgroundColor: Colors.white,
  },
  activeLeftTab: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  activeRightTab: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  activeTabText: {
    color: Colors.secondaryGreen,
  },
  tabText: {
    color: Colors.white,
  },
});

export default Tabs;
