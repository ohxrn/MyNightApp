import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import HomeScreen from "./HomeScreen";
import io from "socket.io-client";
import { auth } from "../Components/Config";

function Voting(props) {
  const [user, setUser] = useState("");

  useEffect(() => {
    const socket = io("https://5b09-192-80-65-177.ngrok-free.app");
    if (user == "") {
      setUser("not in range of party");
    }
    socket.on("serverEnterRoom", (data) => {
      console.log("HERE DATA", data);
      setUser(data);
    });

    socket.emit("buttonMessage", auth.currentUser?.email);

    return () => {
      // Clean up the socket connection when the socketRoom value changes
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Text>Let's see what's playing</Text>
        <Text>{user}</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Voting;
