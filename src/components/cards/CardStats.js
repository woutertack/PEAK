import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardStats = ({ number, label }) => {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statNumber}>{number}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 10,
    padding: 14,
    width: '48%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'regular',
  },
});

export default CardStats;
