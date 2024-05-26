import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../../consts/Colors';

const PrimaryButton = ({ label, onPress, isLoading, isDisabled, icon }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={styles.button}
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.16)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.innerShadow}
      />
      {!isLoading ? (
        <>

          <Text style={styles.buttonText}>
            {label}
          </Text>
        </>
      ) : (
        <ActivityIndicator color="#FFF" />
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    position: 'relative', // Required for absolute positioning of the gradient
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'Bahnschrift',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 1, // Ensure text appears above the gradient
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.16)',
    },
  innerShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8, // Match the button's border radius
  },

});
