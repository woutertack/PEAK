import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "react-native-rapi-ui";
import Navigation from "./src/navigation";
import { AuthProvider } from "./src/provider/AuthProvider";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Colors from "./src/consts/Colors";
import { HealthConnectProvider } from "./src/provider/HealthConnectProvider";
import { usePushNotifications } from "./src/helpers/usePushNotifications";

export default function App() {

  // const { expoPushToken, notification } = usePushNotifications();
  //   const data = JSON.stringify(notification, undefined, 2);
  //   console.log(expoPushToken)


  return (
    <AuthProvider>
      <HealthConnectProvider>
        <ThemeProvider>
          <Navigation  />
          <StatusBar />
        </ThemeProvider>
      </HealthConnectProvider>
    </AuthProvider>
  );
}

