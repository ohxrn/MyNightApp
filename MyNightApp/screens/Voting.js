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

function Voting(props) {
  // State variables
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState("");
  const [groupName, setGroupName] = useState({});
  const [context, setContext] = useState("");
  const [theText, setTheText] = useState("");
  const [roomText, setRoomText] = useState([]);
  const [roomGroupChat, setRoomGroupChat] = useState([]);

  // Establishing the socket connection
  useEffect(() => {
    const newSocket = io("https://9219-192-80-65-177.ngrok-free.app");

    // Handle socket connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Handle successful connection
    newSocket.on("connect", () => {
      console.log("Socket connected on voting page -", newSocket.connected);
      newSocket.on("groupSituation", (data) => {
        console.log("Received groupSituation event. Data:", data);
        setGroupName(data);
      });
    });

    // Handle other socket events...
    newSocket.on("roomTextFromServer", (data) => {
      setRoomGroupChat((prevRoomGroupChat) => [...prevRoomGroupChat, data]);
    });
    // Set the socket state variable
    setSocket(newSocket);

    // Cleanup function to disconnect the socket when the component is unmounted
    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected on voting page");
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Function to send context to the server
  const sendContext = () => {
    if (theText.trim() !== "") {
      const groupFilter = { text: theText, room: groupName.room };
      socket.emit("sendGroupToServer", groupFilter);
      console.log("THIS IS SENT", groupFilter);
      setTheText(""); // Clear the text after sending
    }
  };

  // JSX for the component
  return (
    <SafeAreaView
      style={{ backgroundColor: "purple", flex: 1, justifyContent: "flex-end" }}
    >
      <View style={{ backgroundColor: "darkblue", flex: 3 }}>
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
            fontSize: 22,
            color: "red",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Welcome to the{" "}
          {!groupName.room ? <Text>...</Text> : <Text>{groupName.room}</Text>}{" "}
          room!
        </Text>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }}
        >
          (You can now chat with other people in the {groupName.room} area.)
        </Text>
        {/* Rest of your UI components */}
        <TextInput
          style={{
            backgroundColor: "white",
            width: "80%",
            height: 40,
            borderRadius: 7,
            borderWidth: 0.2,
            alignSelf: "center",
          }}
          placeholder="Talk to people at XX"
          value={theText}
          onChangeText={(text) => {
            setTheText(text);
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            width: "30%",
            height: 30,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginTop: 20,
          }}
          onPress={sendContext}
        >
          <Text style={{ fontSize: 20 }}>Send</Text>
        </TouchableOpacity>
      </View>
      <View style={{ textAlign: "center" }}>
        {roomGroupChat.map((message, key) => {
          return (
            <View
              style={{ backgroundColor: "white", borderRadius: 20, margin: 2 }}
            >
              <Text
                style={{ textAlign: "center", fontSize: 16, fontWeight: "700" }}
                key={key}
              >
                {message.text}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={{ color: "red", fontSize: 22, textAlign: "center" }}>
        {user}
      </Text>
    </SafeAreaView>
  );
}

export default Voting;
