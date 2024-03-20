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
  const [friendRequests, setFriendRequests] = useState([]);

  //--------------------Friend Requests Portion----------------------//
  useEffect(() => {
    const friendRetrieval = ref(database, `User Data/${auth.currentUser?.uid}`);
    get(friendRetrieval)
      .then((data) => {
        const requestData = data.val();

        const filteredData = requestData.friendRequests;
        const uniqueRequests = [...new Set(filteredData)];

        const promises = uniqueRequests.map((userId) => {
          // Retrieve the username for each user ID
          const userRef = ref(database, `User Data/${userId}`);
          return get(userRef).then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
              return userData.username;
            }
            return null; // Return null if user data not found
          });
        });

        Promise.all(promises).then((usernames) => {
          // Filter out null values and set the usernames in state
          const filteredUsernames = usernames.filter(
            (username) => username !== null
          );
          setFriendRequests(filteredUsernames);
        });
      })
      .catch((error) => {
        console.error("Error fetching friend requests:", error);
      });
  }, []);
  //------------------------------------------------------------------

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
          // console.log("USER DATA", userData);
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
        <View style={styles.friendStatusSection}>
          <Text style={styles.friendRequestTitle}>Friend requests</Text>
          <FlatList
            data={friendRequests}
            renderItem={({ item }) => (
              <View style={styles.friendRequestItem}>
                <Text style={styles.friendRequestText}>{item}</Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity style={styles.acceptButton}>
                    <Text style={{ color: "white" }}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.denyButton}>
                    <Text style={{ color: "white" }}>Deny</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
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
  friendStatusSection: {
    flex: 1,
    marginBottom: 20,
  },
  friendRequestItem: {
    backgroundColor: "lightgray",
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  friendRequestText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 8,
    marginRight: 10, // Added margin to separate accept and deny buttons
  },
  denyButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
  },
  addFriendButton: {
    backgroundColor: "lightblue",
    padding: 20,
    borderRadius: 10,
  },
  searchInput: {
    width: "80%",
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 22,
    paddingHorizontal: 20,
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
    width: "80%",
  },
});

export default AddFriend;
