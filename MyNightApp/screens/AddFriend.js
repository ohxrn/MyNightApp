import React, { useEffect, useState } from "react";
import { auth } from "../Components/Config";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";

function AddFriend(props) {
  const database = getDatabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});

  useEffect(() => {
    fetchUsernames();
  }, []);

  const fetchUsernames = () => {
    const uid = auth.currentUser?.uid;
    const userRef = ref(database, `User Data/`);

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();

        if (userData) {
          const usernames = Object.keys(userData).map(
            (key) => userData[key].username
          );
          // Initialize friend status for each user
          const initialFriendStatus = {};
          usernames.forEach((username) => {
            initialFriendStatus[username] = "Add Friend";
          });
          setFriendStatus(initialFriendStatus);
          setSearchResults(usernames);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const addFriendFunc = (item) => {
    console.log("friend added", item);
    // Update friend status for the specific user
    setFriendStatus((prevStatus) => ({
      ...prevStatus,
      [item]: "Request Sent",
    }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends..."
          placeholderTextColor={"pink"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text>{item}</Text>
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={() => addFriendFunc(item)}
              >
                <Text>{friendStatus[item]}</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  addFriendButton: {
    backgroundColor: "lightblue",
    padding: 20,
    borderRadius: 10,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 22,
    paddingHorizontal: 50,
    paddingVertical: 15,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row", // Arrange children horizontally
    alignItems: "center", // Align children vertically at the center
    justifyContent: "space-between", // Distribute children evenly along the row
    borderRadius: 20,
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
  },
});

export default AddFriend;
