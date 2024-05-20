import { StatusBar } from "expo-status-bar";
import React, {useCallback} from "react";
import { ThemeProvider } from "react-native-rapi-ui";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/provider/AuthProvider";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Colors from "./src/consts/Colors";
import { StepProvider } from "./src/provider/StepProvider";




export default function App() {
 

  return (
    <>
      <AuthProvider>
     
        <Navigation />
      
      </AuthProvider>
      <StatusBar />
    </>
  );
}

