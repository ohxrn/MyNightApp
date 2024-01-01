import { View, Text } from "react-native";
import React from "react";
import { auth } from "../Components/Config";

export default function ProfileSetup() {
  return (
    <View>
      <Text>{JSON.stringify(auth)}</Text>
    </View>
  );
}
