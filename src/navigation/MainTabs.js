import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { themeColor, useTheme } from "react-native-rapi-ui";
import TabBarIcon from "../components/utils/TabBarIcon";
import TabBarText from "../components/utils/TabBarText";

import Home from "../screens/Home";



const Tabs = createNativeStackNavigator();
const MainTabs = () => {

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        display: 'hidden',
      }}
    >
      <Tabs.Screen
        name="Home"
        component={Home}
        
      />
    </Tabs.Navigator>
  );
};

export default MainTabs;

