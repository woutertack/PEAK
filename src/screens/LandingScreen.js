import { ScrollView, StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import React from 'react';
import Logo from '../components/utils/icons/Logo';
import { Layout } from 'react-native-rapi-ui';
import { StatusBar } from "expo-status-bar";
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import Swiper from '../components/slider/Slider';
import slides from '../components/slider/SliderData';
import Colors from '../consts/Colors';

const LandingScreen = ({ navigation }) => {

  
  
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.logoContainer}>
            <Logo width={146.974} height={36.269} style={styles.logo}/>
          </View>
          <View >
            <Swiper />
          </View>
          <View style={styles.buttons}>
            <PrimaryButton
              label={'Creëer een account'}
              onPress={() => navigation.navigate("Register")}
            />
            <SecondaryButton
              label={'Login'}
              onPress={() => navigation.navigate("Login")}
            />
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.secondaryGreen,
  },
  contentContainer: {
    flex: 1, // Makes sure the container fills the space
    justifyContent: 'space-between', // Pushes the logo to the top and buttons to the bottom
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  buttons: {
    width: '100%',
    paddingHorizontal: 25,
    paddingBottom: 40, // Ensure some padding at the bottom
   
  },
});
