// src/components/cards/CardChallenge.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Colors from '../../consts/Colors';
import TimerIcon from '../utils/icons/TimerIcon';

const CardChallenge = ({ title, progress, description, initialTimeLeft, creationTime, type }) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const creationDate = new Date(creationTime);
      let endTime;

      switch (type) {
        case 'daily':
          endTime = new Date(creationDate);
          endTime.setHours(24, 0, 0, 0); // Set time to midnight of the creation date
          break;
        case 'weekly':
          endTime = new Date(creationDate);
          endTime.setDate(creationDate.getDate() + 7); // 7 days from creation time
          break;
        case 'monthly':
          endTime = new Date(creationDate);
          endTime.setMonth(creationDate.getMonth() + 1); // 1 month from creation time
          break;
        default:
          endTime = new Date();
      }

      const remainingTime = endTime - now;
      const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTime / 1000) % 60);

      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

      if (type === 'daily') {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (type === 'weekly' || type === 'monthly') {
        setTimeLeft(`${days}d ${hours}h`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [type, creationTime]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.timer}>
          <TimerIcon />
          <Text style={styles.timeLeft}>{timeLeft}</Text>
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
    marginTop: -1
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressTextContainer: {
    marginLeft: 0,
    marginTop: 5
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

export default CardChallenge;
