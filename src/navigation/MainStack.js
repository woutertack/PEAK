import React from "react";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profile from "../screens/Profile";
import Home from "../screens/Home";
import Colors from "../consts/Colors";
import Streaks from "../screens/Streaks";
import Settings from "../screens/Settings";
import EditProfile from "../screens/EditProfile";
import Challenges from "../screens/Challenges";
import Friends from "../screens/Friends";
import FriendsProfile from "../screens/FriendsProfile";
import BottomTabs from "./BottomTabs";
import CreateVersus from "../screens/CreateVersus";
import AcceptVersus from "../screens/AcceptVersus";

// Create Stack Navigator
const Stack = createNativeStackNavigator();

// Create Drawer Navigator
const Drawer = createDrawerNavigator();

function DrawerContent() {
  return (
    <Drawer.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: Colors.secondaryGreen,
          paddingTop: 20,
          margin: 0,
          width: 240,
        },
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerActiveTintColor: Colors.primaryGreen,
        drawerInactiveTintColor: Colors.white,
      }}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Challenges" component={BottomTabs} />
      <Drawer.Screen name="Friends" component={Friends} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}

function Main() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DrawerContent" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DrawerContent" component={DrawerContent} />
        <Stack.Screen name="Streaks" component={Streaks} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="FriendsProfile" component={FriendsProfile} />
        <Stack.Screen name="CreateVersus" component={CreateVersus} />
        <Stack.Screen name="AcceptVersus" component={AcceptVersus} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Main;
