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
import { getDatabase, ref, set, get } from "firebase/database";

function AddFriend(props) {
  const database = getDatabase();
  const [userData, setUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsernames, setAllUsernames] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});

  useEffect(() => {
    fetchUsernames();
  }, []);
  useEffect(() => {
    if (searchResults.length === 0 && searchQuery.trim() !== "") {
      setSearchResults(["No results"]);
    }
  }, [searchResults, searchQuery]);
  const fetchUsernames = () => {
    const uid = auth.currentUser?.uid;
    const userRef = ref(database, `User Data/`);

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();

        if (userData) {
          console.log("USER DATA", userData);
          setUserData(userData);
          const usernames = Object.keys(userData).map(
            (key) => userData[key].username
          );
          setAllUsernames(usernames);
          setSearchResults(usernames);
          initializeFriendStatus(usernames);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const initializeFriendStatus = (usernames) => {
    const initialFriendStatus = {};
    usernames.forEach((username) => {
      initialFriendStatus[username] = "Add Friend";
    });
    setFriendStatus(initialFriendStatus);
  };

  const addFriendFunc = (item) => {
    console.log("Friend request sent for", item);
    const userId = Object.keys(userData).find(
      (userId) => userData[userId].username === item
    );

    if (userId) {
      console.log("User ID:", userId);

      // Add friend data to the user's data
      const userRef = ref(database, `User Data/${userId}`);
      // Assuming you have a field in the user's data to store friend IDs or mark them as friends
      // For example, you can have a "friends" array
      const newFriendData = {
        ...userData[userId],
        friendRequests: userData[userId].friends
          ? [...userData[userId].friends, auth.currentUser.uid]
          : [auth.currentUser.uid],
      };
      console.log("THIS IS MY USER ID", auth.currentUser?.uid);
      set(userRef, newFriendData)
        .then(() => {
          // Update friend status for the specific user
          setFriendStatus((prevStatus) => ({
            ...prevStatus,
            [item]: "Request Sent",
          }));
          console.log("Friend added successfully");
        })
        .catch((error) => console.error("Error adding friend:", error));
    } else {
      console.log("User not found in userData");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      // If the search query is empty, reset search results to all usernames
      setSearchResults(allUsernames);
    } else {
      // If the search query is not empty, filter usernames based on the query
      const filteredUsernames = allUsernames.filter((username) =>
        username.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredUsernames);
    }
  };
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for friends..."
          placeholderTextColor={"pink"}
          value={searchQuery}
          onChangeText={handleSearch}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    backgroundColor: "white",
    padding: 20,
    marginBottom: 10,
  },
});

export default AddFriend;
