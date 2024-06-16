// // notifications.js
// import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';

// // Request permission to use notifications
// export async function requestNotificationsPermissions() {
//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') {
//     alert('Failed to get push token for push notification!');
//     return;
//   }

  
//     const token = (await Notifications.getExpoPushTokenAsync()).data;
//     // console.log(token);
//     return token;
 
// }

// // Schedule a notification
// export async function scheduleNotification(title, body) {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       android: {
//         largeIcon: "../../assets/IconNotification.png"
//       }
//     },
//     trigger: {
//       seconds: 2,
//     },
//   });
// }

// // Handle notification received
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });
