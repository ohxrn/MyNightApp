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
import DJSide from "./screens/DJSide";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRef } from "react";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  // registerNNPushToken(11405, "TetwsDIx2V6LHpXAJmmtMz");
  const [initialRoute, setInitialRoute] = useState("Login");
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
      alert("Must use physical device for Push Notifications");
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setInitialRoute("Welcome");
      } else {
        setInitialRoute("Login");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={UserForm} />

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
          component={MainNavigator}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
function MainNavigator() {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Voting"
        component={Voting}
        options={{ tabBarLabel: "See Rooms" }}
      />
      <Tab.Screen
        name="DJSide"
        component={DJSide}
        options={{ tabBarLabel: "Join as DJ" }}
      />
    </Tab.Navigator>
  );
}

export default App;
