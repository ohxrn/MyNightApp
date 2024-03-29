import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import io from "socket.io-client";
import { auth, storage } from "../Components/Config";
import { get } from "firebase/database";
// import { storage } from "firebase/storage";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
//

function Voting(props) {
  // State variables
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [username, setUsername] = useState();
  const [age, setAge] = useState();
  const [bio, setBio] = useState();
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState("");
  const [groupName, setGroupName] = useState({});

  const [theText, setTheText] = useState("");

  const [roomGroupChat, setRoomGroupChat] = useState([]);
  //
  const [imageURL, setImageURL] = useState(undefined);

  const [imageLinks, setImageLinks] = useState([]);

  //--------- receive image links, display in return-----------------
  useEffect(() => {
    const userFolderRef = ref(storage, "PhotoBase/" + auth?.currentUser.uid);

    listAll(userFolderRef)
      .then((result) => {
        // result.items is an array of references to each photo
        const downloadPromises = result.items.map((itemRef) => {
          return getDownloadURL(itemRef);
        });

        // Promise.all resolves when all downloadURL promises are resolved
        return Promise.all(downloadPromises);
      })
      .then((downloadURLs) => {
        // downloadURLs is an array of URLs for each photo
        // You can handle these URLs as needed, for example, displaying them in your UI
        console.log(downloadURLs);
        setImageLinks(downloadURLs);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
      });
    //
  }, []);

  //

  //

  // Establishing the socket connection
  useEffect(() => {
    const newSocket = io("https://c7edc5cabc29.ngrok.app");

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
      const groupFilter = {
        text: theText,
        room: groupName.room || "undefined",
        ID: auth?.currentUser.uid,
        images: imageLinks,
      };

      socket.emit("sendGroupToServer", groupFilter);
      console.log("THIS IS SENT", groupFilter);
      setTheText(""); // Clear the text after sending
    }
  };

  // JSX for the component
  return (
    <SafeAreaView
      style={{
        backgroundColor: "#1f1f1f",
        flex: 1,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0} // Adjust this value as needed
      >
        <Image
          style={{
            width: 70,
            height: 70,
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

        <View style={{ alignItems: "center" }}>
          {roomGroupChat.map((message, key) => {
            return (
              <View
                style={{
                  flexDirection: "row", // Arrange items horizontally
                  alignItems: "center", // Align items vertically
                  backgroundColor: "white",
                  borderRadius: 20,
                  margin: 10,
                  padding: 10,
                  maxWidth: "70%", // Limiting width for better appearance
                  alignSelf:
                    message.ID === auth.currentUser.uid
                      ? "flex-end"
                      : "flex-start", // Aligning based on sender
                }}
                key={key}
              >
                {message.images && message.images.length > 0 && (
                  <View style={{ marginRight: 10 }}>
                    <Image
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25, // Making it round
                      }}
                      source={{ uri: message.images }}
                    />
                  </View>
                )}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color:
                      message.ID === auth.currentUser.uid ? "white" : "black", // Changing text color based on sender
                  }}
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
        <View
          style={{ flex: 1, justifyContent: "flex-end", alignItems: "center" }}
        >
          <TextInput
            style={{
              backgroundColor: "white",
              width: "90%",
              height: 40,
              borderRadius: 7,
              borderWidth: 0.2,
              alignSelf: "center",
              marginBottom: 10,
            }}
            placeholder="Chat it up"
            value={theText}
            onChangeText={setTheText}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "white",
              width: "30%",
              height: 30,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15%",
            }}
            onPress={sendContext}
          >
            <Text style={{ fontSize: 20 }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Voting;
