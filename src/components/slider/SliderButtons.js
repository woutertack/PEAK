import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../consts/Colors';

const SliderButton = ({ label, onPress, isLoading, isDisabled, icon }) => {
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
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={styles.buttonText}>{label}</Text>
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
    backgroundColor: '#05454A',
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    position: 'relative',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    zIndex: 1,
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    marginLeft: 10,
  },
  innerShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  iconContainer: {
    marginRight: 10,
  },
});
