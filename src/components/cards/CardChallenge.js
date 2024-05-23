// ChallengeCard.js
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Colors from '../../consts/Colors';
import TimerIcon from '../utils/icons/TimerIcon';

const CardChallenge = ({ title, progress, description, timeLeft }) => {
  console.log(timeLeft)
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
          fill={progress * 100}
          tintColor={Colors.primaryGreen}
          backgroundColor={Colors.white}
          arcSweepAngle={280}
          rotation={220}
        >
          {
            (fill) => (
              <Text style={styles.progressText}>
                {`${Math.round(progress * 100)}%`}
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
    marginLeft: 15,
    marginTop: 5

  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
   
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
});

export default CardChallenge;
