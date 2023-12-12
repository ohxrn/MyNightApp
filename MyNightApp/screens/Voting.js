import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, SafeAreaView, Image } from "react-native";
import HomeScreen from "./HomeScreen";
import io from "socket.io-client";
import { auth } from "../Components/Config";
import DeviceInfo from "react-native-device-info";
import { MPMusicPlayerController } from "react-native";

function Voting(props) {
  const [user, setUser] = useState("");
  const [groupName, setGroupName] = useState("");

  //actual track grab ---------------

  useEffect(() => {
    const socket = io(
      "https://68e6-2601-19b-280-4960-6d67-fa88-5c7d-1c99.ngrok-free.app"
    );
    if (user == "") {
      setUser("not in range of party");
    }
    socket.on("serverEnterRoom", (data) => {
      console.log("HERE DATA", data);
      setUser(data);
    });
    socket.on("groupNameEnd", (data) => {
      console.log("it came through");
      setGroupName(data);
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
        <Text style={{ fontSize: 22, color: "red" }}>Here{groupName}</Text>
        <Text style={{ fontSize: 22, color: "red", textAlign: "right" }}>
          hey
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
