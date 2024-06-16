import { useState, useEffect, useRef, useContext } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { supabase } from "../lib/initSupabase";

import Constants from "expo-constants";

import { Platform } from "react-native";

import { AuthContext } from "../provider/AuthProvider";


export const usePushNotifications = () => {
  const { session } = useContext(AuthContext);
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState();

  const [notification, setNotification] = useState();

  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if(token && session?.user) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ expo_push_token: token.data })
        .eq("id", session?.user.id);

      if (error) {
        console.error(error);
        return;
      }
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);

      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener?.current
      );

      Notifications.removeNotificationSubscription(responseListener?.current);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};