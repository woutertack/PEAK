import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../../consts/Colors';

const SecondaryButton = ({ label, onPress, isLoading, isDisabled, icon }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={styles.button}
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.1)', 'transparent']}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.innerShadow}
      />
      {!isLoading ? (
        <>
          {/* {icon && <View style={styles.iconContainer}>{icon}</View>} */}
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

export default SecondaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.white,
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: Colors.secondaryGreen,
    fontSize: 16,
    fontWeight: '500',
    zIndex: 1, // Ensure text appears above the gradient
  },
  innerShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8, // Match the button's border radius
  },
  // Uncomment and adjust this style if you reintroduce the icon
  // iconContainer: {
  //   marginRight: 10,
  // }
});
