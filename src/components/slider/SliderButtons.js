import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../../consts/Colors';

const SliderButton = ({ label, onPress, isLoading, isDisabled, icon, noLine  }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={1}
      style={styles.button}
    >
      {!isLoading ? (
        <>
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.buttonText}>{label}</Text>
          </View>
          {!noLine && <View style={styles.line}></View>}
        </>
      ) : (
        <ActivityIndicator color="#FFF" />
      )}
    </TouchableOpacity>
  );
};

export default SliderButton;

const styles = StyleSheet.create({
  button: {

    paddingVertical: 13,
    paddingHorizontal: 15,
   
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    position: 'relative',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',

    marginLeft: 10,
  },
  line: {
    position: 'absolute',
    bottom: -4, // 4px offset from the content
    left: 0, // Align with the left padding of the button
    right: 15, // Align with the right padding of the button
    height: 1,
    backgroundColor: Colors.secondaryGreen,
    opacity: 1,
    width: '105%',
  },
  iconContainer: {
    marginRight: 10,
  },
});
