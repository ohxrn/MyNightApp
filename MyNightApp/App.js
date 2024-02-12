import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import UserForm from "./screens/UserForm";
import HomeScreen from "./screens/HomeScreen";
import CompanyForm from "./screens/CompanyForm";
import CompanySubmit from "./screens/CompanySubmit";
import { auth } from "./Components/Config";
import Voting from "./screens/Voting";
import LinearGradient from "react-native-linear-gradient";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRef } from "react";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import theLogo from "./assets/MNLOGO.png";
import Intro from "./screens/Intro";
import Profile from "./screens/Profile";
//
import UserSetup from "./screens/UserSetup";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

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
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  async function sendPushNotification(expoPushToken) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }
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
        alert("Failed to get push token for push notification!");
        return;
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
      console.log(token);
    } else {
      alert("Must use a physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen
          name="Intro"
          component={Intro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserSetup"
          component={UserSetup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={UserForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CompanyForm"
          options={{ headerShown: false }}
          component={CompanyForm}
        />
        <Stack.Screen
          name="CompanySubmit"
          options={{ headerShown: false }}
          component={CompanySubmit}
        />
        <Stack.Screen
          name="HomeScreen"
          options={{ headerShown: false }}
          component={TabNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0, // This removes the shadow on Android
          backgroundColor: "#0F0F0F",
          borderTopLeftRadius: 20, // Adjust the border radius as needed
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: "blue", // Set the active tab text color
        tabBarInactiveTintColor: "lightgreen", // Set the inactive tab text color
        borderTopLeftRadius: 20, // Adjust the border radius as needed
        borderTopRightRadius: 20,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ tabBarLabel: "Home", headerShown: false }}
      />
      <Tab.Screen
        name="Voting"
        component={Voting}
        options={{ tabBarLabel: "Chat room", headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ tabBarLabel: "Edit Profile", headerShown: false }}
      />
      <Tab.Screen
        name="UserSet"
        component={UserSetup}
        options={{ tabBarLabel: "Edit Profile", headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default App;
