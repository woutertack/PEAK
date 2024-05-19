import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from '@react-navigation/native';
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ForgetPassword from "../screens/auth/ForgetPassword";
import LandingScreen from "../screens/LandingScreen";
import Loading from "../screens/utils/Loading";

const AuthStack = createNativeStackNavigator();
const Auth = () => {
  return (
    <NavigationContainer >
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      
        <AuthStack.Screen name="LandingScreen" component={LandingScreen} />
        <AuthStack.Screen name="Login" component={Login} />
        <AuthStack.Screen name="Register" component={Register} />
        <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
      
    </AuthStack.Navigator>
    </NavigationContainer >
  );
};

export default Auth;
