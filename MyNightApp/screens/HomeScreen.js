import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();
  const signOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => {
        alert(error.message);
      });
  };
  return (
    <View>
      <Text>Welcome, {auth.currentUser?.email}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
