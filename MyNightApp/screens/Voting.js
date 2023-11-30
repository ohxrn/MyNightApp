import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, SafeAreaView, Image } from "react-native";
import HomeScreen from "./HomeScreen";
import io from "socket.io-client";
import { auth } from "../Components/Config";
import DeviceInfo from "react-native-device-info";
import { MPMusicPlayerController } from "react-native";

function Voting(props) {
  const [user, setUser] = useState("");

  //actual track grab ---------------

  useEffect(() => {
    const socket = io(
      "https://66f2-2601-19b-280-4960-991a-168d-d1f9-7e02.ngrok-free.app"
    );
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
    <SafeAreaView
      style={{
        backgroundColor: "purple",
        flex: 1,
        justifyContent: "flex-end",
      }}
    >
      <View style={{ backgroundColor: "darkblue", flex: 3 }}>
        <Text style={{ fontSize: 22, color: "red" }}>
          Let's see what's playing
        </Text>
        <Image
          style={{
            width: 150,
            height: 150,
            justifyContent: "center",
            alignSelf: "center",
          }}
          source={require("../assets/disco.gif")}
        />
      </View>

      <Text
        style={{
          color: "red",
          fontSize: 22,
          textAlign: "center",
        }}
      >
        {user}
      </Text>
    </SafeAreaView>
  );
}

export default Voting;
