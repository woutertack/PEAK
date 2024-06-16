import { max } from 'date-fns';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import Colors from '../../consts/Colors';
import getChallengeTypeText from '../utils/getChallengeTypeText';

const DailyChallengeCard = ({  goal, unit, navigation }) => {
  const progress = 1;
  const formattedProgress = progress.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2});
  const progressPercentage = 1.2 / goal;

  const type = getChallengeTypeText(unit);


  return (
    <>
    <Text style={styles.title}>Dagelijkse uitdaging</Text>
    <View style={styles.underline}></View>
    <View style={styles.card}>
    {/* <Text style={styles.titleInside}>Daily challenge</Text>
    <View style={styles.underlineInside}></View> */}
    <TouchableOpacity onPress={() => navigation.navigate("Challenges")}  activeOpacity={0.9}>
      <View styles={styles.progressBarContainer}>
        <Text style={styles.progressText}>{`${formattedProgress} / ${goal} ${type}`}</Text>
        <Progress.Bar 
          progress={progressPercentage} 
          width={160} 
          color={Colors.secondaryGreen} 
          unfilledColor="#e0e0e0"
          borderWidth={0}
          borderRadius={5}
          height={15}
          style={styles.progressBar} 
        />
      </View>
    </TouchableOpacity>
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
    elevation: 4,
    alignItems: 'start',
    maxWidth: 190,
  },
  title : {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondaryGreen,
    marginBottom: 0,
    marginLeft: 5, 
  },
  underline: {
    left: 5,
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
    fontSize: 15,
    color: Colors.secondaryGreen,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',

  },
});

export default DailyChallengeCard;
