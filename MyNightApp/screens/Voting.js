import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import HomeScreen from "./HomeScreen";
import io from "socket.io-client";
import { auth } from "../Components/Config";
import DeviceInfo from "react-native-device-info";
import { MPMusicPlayerController } from "react-native";
import { Button } from "react-native-paper";

function Voting(props) {
  const [user, setUser] = useState("");
  const [groupName, setGroupName] = useState("");
  const [context, setContext] = useState("");

  //
  const sendContext = () => {
    console.log("THIS IS SENT", context);

    socket.emit(context);
  };
  //

  useEffect(() => {
    const socket = io(
      "https://f410-2601-19b-280-4960-bc6a-9e0b-d312-1217.ngrok-free.app"
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
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            width: "30%",
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
          onPress={sendContext}
        >
          <Text style={{ fontSize: 20 }}>Send</Text>
        </TouchableOpacity>
        <TextInput
          style={{
            backgroundColor: "white",
            width: "80%",
            height: 40,
            borderRadius: 7,
            borderWidth: 0.2,
            textAlign: "center",
            margin: 2,
          }}
          placeholder="Talk to people at XX"
          value={context}
          onChangeText={(content) => setContext(content)}
        />
        <Image
          style={{
            width: 150,
            height: 150,
            justifyContent: "center",
            alignSelf: "center",
          }}
          source={require("../assets/disco.gif")}
        />
        <Text
          style={{
            fontSize: 40,
            color: "red",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {context}
        </Text>
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
