// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // or any other icon library
import Challenges from '../screens/Challenges';
import Versus from '../screens/Versus'; // Create this screen if you don't have it yet
import Ranking from '../screens/Ranking'; // Create this screen if you don't have it yet
import Colors from '../consts/Colors';
import WalkingIcon from '../components/utils/icons/WalkingIcon';
import VersusIcon from '../components/utils/icons/VersusIcon';
import RankingIcon from '../components/utils/icons/RankingIcon';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: Colors.lightGreen, 
        height: 70, // Adjust the height as needed
        paddingBottom: 10, // Adjust padding to remove unwanted borders
        paddingTop: 10, // Adjust padding to remove unwanted borders
        borderTopWidth: 0, // Remove the top border
      },
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Challenges') {
          return <WalkingIcon fill={color} />;
        } else if (route.name === 'Versus') {
          return <VersusIcon fill={color} />;
        } else if (route.name === 'Ranking') {
          return <RankingIcon fill={color} />;
        }
      },
    })}
      tabBarOptions={{
        activeTintColor: Colors.white,
        inactiveTintColor: Colors.secondaryGreen,
      }}
    >
      <Tab.Screen name="Challenges" component={Challenges} />
      <Tab.Screen name="Versus" component={Versus} />
      <Tab.Screen name="Ranking" component={Ranking} />
    </Tab.Navigator>
  );
}

export default BottomTabs;
