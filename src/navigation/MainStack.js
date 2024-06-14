import React from "react";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Profile from "../screens/Profile";
import Home from "../screens/Home";
import Colors from "../consts/Colors";
import Streaks from "../screens/Streaks";

import EditProfile from "../screens/EditProfile";
import Challenges from "../screens/Challenges";
import Friends from "../screens/Friends";
import FriendsProfile from "../screens/FriendsProfile";
import BottomTabs from "./BottomTabs";
import CreateVersus from "../screens/CreateVersus";
import AcceptVersus from "../screens/AcceptVersus";
import HistoryVersus from "../screens/HistoryVersus";
import SelectLevelUser from "../screens/SelectLevelUser";
import LandingScreen from "../screens/LandingScreen";
import CompletedChallenges from "../screens/CompletedChallenges";
import MapFriend from "../screens/MapFriend";


// Create Stack Navigator
const Stack = createNativeStackNavigator();


function Main() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profiel' }}/>
        <Stack.Screen name="Challenges" component={BottomTabs} options={{ title: 'Uitdagingen' }}/>
        <Stack.Screen name="Friends" component={Friends} options={{ title: 'Vrienden' }}/>
        <Stack.Screen name="Streaks" component={Streaks} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="FriendsProfile" component={FriendsProfile} />
        <Stack.Screen name="CreateVersus" component={CreateVersus} />
        <Stack.Screen name="AcceptVersus" component={AcceptVersus} />
        <Stack.Screen name="HistoryVersus" component={HistoryVersus} />
        <Stack.Screen name="SelectLevelUser" component={SelectLevelUser} />
        <Stack.Screen name="CompletedChallenges" component={CompletedChallenges} />
        <Stack.Screen name="MapFriend" component={MapFriend} />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default Main;
