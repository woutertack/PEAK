import React from "react";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
import HistoryVersus from "../screens/HistoryVersus";
import SelectLevelUser from "../screens/SelectLevelUser";
import LandingScreen from "../screens/LandingScreen";
import CompletedChallenges from "../screens/CompletedChallenges";

// Create Stack Navigator
const Stack = createNativeStackNavigator();

// Create Drawer Navigator
// const Drawer = createDrawerNavigator();

// function DrawerContent() {
//   return (
//     <Drawer.Navigator 
//       initialRouteName="Home"
//       screenOptions={{
//         headerShown: false,
//         drawerStyle: {
//           backgroundColor: Colors.secondaryGreen,
//           paddingTop: 20,
//           margin: 0,
//           width: 240,
//         },
//         drawerType: 'slide',
//         overlayColor: 'transparent',
//         drawerActiveTintColor: Colors.primaryGreen,
//         drawerInactiveTintColor: Colors.white,
//       }}>
//       <Drawer.Screen name="Home" component={Home} />
//       <Drawer.Screen name="Profile" component={Profile} options={{ title: 'Profiel' }}/>
//       <Drawer.Screen name="Challenges" component={BottomTabs} options={{ title: 'Uitdagingen' }}/>
//       <Drawer.Screen name="Friends" component={Friends} options={{ title: 'Vrienden' }}/>
//       <Drawer.Screen name="Settings" component={Settings} />
//     </Drawer.Navigator>
//   );
// }

function Main() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profiel' }}/>
        <Stack.Screen name="Challenges" component={BottomTabs} options={{ title: 'Uitdagingen' }}/>
        <Stack.Screen name="Friends" component={Friends} options={{ title: 'Vrienden' }}/>
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Streaks" component={Streaks} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="FriendsProfile" component={FriendsProfile} />
        <Stack.Screen name="CreateVersus" component={CreateVersus} />
        <Stack.Screen name="AcceptVersus" component={AcceptVersus} />
        <Stack.Screen name="HistoryVersus" component={HistoryVersus} />
        <Stack.Screen name="SelectLevelUser" component={SelectLevelUser} />
        <Stack.Screen name="CompletedChallenges" component={CompletedChallenges} />

      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default Main;
