import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import io from "socket.io-client";
import { auth } from "../Components/Config";
import HomeScreen from "./HomeScreen";

function Voting(props) {
  const socket = io(
    "https://e907-2601-19b-280-4960-cd3e-4a80-f38-4949.ngrok-free.app"
  );
  const [user, setUser] = useState("");
  const [groupName, setGroupName] = useState([]);
  const [context, setContext] = useState("");

  useEffect(() => {
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle successful connection
    socket.on("connect", () => {
      console.log("Socket connected:", socket.connected);
      socket.on("groupSituation", (data) => {
        console.log("Received groupSituation event. Data:", data);
        setGroupName(data);
      });
    });

    if (user === "") {
      setUser("not in range of party");
    }
    socket.on("serverEnterRoom", (data) => {
      console.log("HERE DATA", data);
      setUser(data);
    });
    socket.emit("buttonMessage", auth.currentUser?.email);
    return () => {
      socket.disconnect();
    };
  });

  const sendContext = () => {
    console.log("THIS IS SENT", context);
    socket.emit("groupSituation", context);
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: "purple", flex: 1, justifyContent: "flex-end" }}
    >
      <View style={{ backgroundColor: "darkblue", flex: 3 }}>
        <Text style={{ fontSize: 22, color: "red" }}>
          Here{JSON.stringify(groupName)}
        </Text>
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

      <Text style={{ color: "red", fontSize: 22, textAlign: "center" }}>
        {user}
      </Text>
    </SafeAreaView>
  );
}

export default Voting;
