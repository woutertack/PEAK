// src/components/cards/CardChallenge.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Colors from '../../consts/Colors';
import TimerIcon from '../utils/icons/TimerIcon';
import SecondaryButton from '../utils/buttons/SecondaryButton';
import TertiaryButton from '../utils/buttons/TertiaryButton';

const CardChallengeCompleted = ({ title, progress, description, initialTimeLeft, creationTime, type, completed, onRestart }) => {
 


  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
       
        <View style={styles.timer}>
          {/* <TimerIcon /> */}
          <Text style={styles.timeLeft}>{initialTimeLeft}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <AnimatedCircularProgress
          size={80}
          width={10}
          fill={Math.min(progress * 100, 100)} // Ensure the fill value does not exceed 100
          tintColor={Colors.primaryGreen}
          backgroundColor={Colors.white}
          arcSweepAngle={280}
          rotation={220}
          lineCap={'round'}
        >
          {
            (fill) => (
              <Text style={styles.progressText}>
                {`${Math.min(Math.round(progress * 100), 100)}%`} {/* Ensure the displayed value does not exceed 100 */}
              </Text>
            )
          }
        </AnimatedCircularProgress>
        <View style={styles.progressTextContainer}>
          <Text style={styles.description}>{description}</Text>
        </View>
        {completed && (
        <SecondaryButton label="Nieuwe uitdaging" onPress={onRestart} color={Colors.primary} />
      )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    textAlign: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  timer: {
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 4
  },
  timeLeft: {
    fontSize: 13,
    color: Colors.white,
    marginLeft: 6,
    marginTop: -1,
    fontWeight: 'bold'
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressTextContainer: {
    marginLeft: 0,
    marginTop: 5,
    marginBottom: 10,
  },
  progressText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 4,
    alignContent: 'center',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
});

export default CardChallengeCompleted;
