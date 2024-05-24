import { max } from 'date-fns';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import Colors from '../../consts/Colors';

const DailyChallengeCard = ({ progress, goal, unit }) => {
  const progressPercentage = progress / goal;


  return (
    <>
    <Text style={styles.title}>Daily challenge</Text>
    <View style={styles.underline}></View>
    <View style={styles.card}>
    {/* <Text style={styles.titleInside}>Daily challenge</Text>
    <View style={styles.underlineInside}></View> */}
      <View styles={styles.progressBarContainer}>
        <Text style={styles.progressText}>{`${Math.floor(progress)} / ${goal} ${unit}`}</Text>
        <Progress.Bar 
          progress={progressPercentage} 
          width={200} 
          color={Colors.secondaryGreen} 
          unfilledColor="#e0e0e0"
          borderWidth={0}
          borderRadius={5}
          height={15}
          style={styles.progressBar} 
        />
      </View>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'start',
    maxWidth: 200,
  },
  title : {
    fontSize: 21,
    fontWeight: 'bold',
    color: Colors.secondaryGreen,
    marginBottom: 0,
    marginLeft: 10, 
  },
  underline: {
    left: 7,
    width: 170,
    height: 3,  // 3px width
    backgroundColor: Colors.secondaryGreen,
    marginBottom: 10,
  },
  titleInside: {
    fontSize: 21,
    color: Colors.secondaryGreen,
    fontWeight: 'bold',
    marginBottom: 0,
    },
    underlineInside : {
      left: 0,
    width: 165,
    height: 3,  // 3px width
    backgroundColor: Colors.secondaryGreen,
    marginBottom: 10,
    },
  progressText: {
    fontSize: 16,
    color: Colors.secondaryGreen,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
  },
});

export default DailyChallengeCard;
