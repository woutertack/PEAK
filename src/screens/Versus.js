import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, Alert,  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import Avatar from '../components/Avatar';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import useStatusBar from '../helpers/useStatusBar';
import HistoryIcon from '../components/utils/icons/HistoryIcon';

const Versus = ({ navigation }) => {
  useStatusBar(Colors.secondaryGreen, 'light-content');

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TabBarIcon
              library="AntDesign"
              icon="arrowleft"
              size={38}
              style={styles.iconBack}
              onPress={() => {
                navigation.navigate('Home');
              }}
            />
            <Text style={styles.headerText}>Versus</Text>
            <TouchableOpacity onPress={() => Alert.alert('Coming soon!')}>
            <HistoryIcon style={styles.iconPlaceholder} />
            </TouchableOpacity>
          </View>
          
         
     
        </ScrollView>
        <TouchableOpacity onPress={() => navigation.navigate('CreateVersus')}>
        <View style={styles.addButton}>
          <TabBarIcon
                library="AntDesign"
                icon="plus"
                size={38}
                style={styles.icon}
                onPress={() => {
                  navigation.navigate('CreateVersus');
                }}
              />
        </View>
        </TouchableOpacity>
        
      </Layout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryGreen,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Make room for the button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  iconPlaceholder: {
    width: 38, // Match the icon size
    height: 38, // Match the icon size
  },
  icon: {
    color: Colors.secondaryGreen,
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 15,
    paddingBottom: 15,
    
  },
});

export default Versus;
