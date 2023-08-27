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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState("Login");

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
