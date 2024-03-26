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
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, set, get, remove, update } from "firebase/database";

function AddFriend(props) {
  const database = getDatabase();
  const [userData, setUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsernames, setAllUsernames] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendUsernames, setFriendUsernames] = useState([]);

  //-----------------[[retrieve friends to display section]]-----------------------------------------------
  useEffect(() => {
    const friendRef = ref(
      database,
      `User Data/${auth.currentUser?.uid}/friends`
    );
    get(friendRef)
      .then((snapshot) => {
        const friendIds = snapshot.val() || [];
        const promises = friendIds.map((friendId) => {
          // Retrieve the username for each friend ID
          const userRef = ref(database, `User Data/${friendId}`);
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
          // Set the filtered usernames as a new state
          setFriendUsernames(filteredUsernames);
        });
      })
      .catch((error) => {
        console.error("Error fetching friends:", error);
      });
  }, []);
  //----------------------------------------------------------------

  const navigation = useNavigation();
  const signOut = () => {
    auth
      .signOut()
      .then((auth) => {
        navigation.replace("Login");
      })
      .catch((error) => {
        alert(error.message);
      });
  };
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
  const invitationDecision = (item) => {
    console.log("Pressed accept for", item);
    const userId = Object.keys(userData).find(
      (userId) => userData[userId].username === item
    );

    if (userId) {
      console.log("User ID:", userId);
      //
      const otherFriendRef = ref(database, `User Data/${userId}/friends`);
      get(otherFriendRef)
        .then((data) => {
          console.log("this is data from other friend", data);
          const existingFriends = data.val() || [];
          if (!existingFriends.includes(auth.currentUser?.uid)) {
            const newFriends = [...existingFriends, auth.currentUser?.uid];
            set(otherFriendRef, newFriends)
              .then(() => {
                console.log("Friend added successfully");
                setFriendUsernames(existingFriends);
              })
              .catch((error) => console.error("Error adding friend:", error));
          } else {
            console.log("User is already a friend");
          }
        })
        .catch((data) => {});
      //

      // Construct the reference to the specific friend request object
      const friendRequestRef = ref(
        database,
        `User Data/${auth.currentUser?.uid}/friendRequests/`
      );

      // Update the status of the friend request to null
      const updateData = {};
      updateData[userId] = null;

      update(friendRequestRef, updateData)
        .then(() => {
          console.log("Friend request status updated successfully");
          const userRef = ref(
            database,
            `User Data/${auth.currentUser.uid}/friends`
          );
          get(userRef)
            .then((snapshot) => {
              const existingFriends = snapshot.val() || [];
              if (!existingFriends.includes(userId)) {
                const newFriends = [...existingFriends, userId];
                set(userRef, newFriends)
                  .then(() => {
                    console.log("Friend added successfully");
                    setFriendUsernames(existingFriends);
                  })
                  .catch((error) =>
                    console.error("Error adding friend:", error)
                  );
              } else {
                console.log("User is already a friend");
              }
            })
            .catch((error) =>
              console.error("Error fetching current friends:", error)
            );
        })
        .catch((error) => {
          console.log("Error updating friend request status:", error);
        });
    } else {
      console.log("User not found in userData");
    }
  };
  //-------------------------------------------------------------------

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
      const newFriendData = {
        ...userData[userId],
        friendRequests: userData[userId].friends
          ? [...userData[userId].friends, auth.currentUser.uid]
          : [auth.currentUser.uid],
      };
      set(userRef, newFriendData)
        .then(() => {
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
      setSearchResults(allUsernames);
    } else {
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
          <TouchableOpacity onPress={signOut}>
            <Text style={{ color: "white" }}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.friendRequestTitle}>Friend Requests</Text>
          <FlatList
            data={friendRequests}
            renderItem={({ item }) => (
              <View style={styles.friendRequestItem}>
                <Text style={styles.friendRequestText}>{item}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => invitationDecision(item)}
                    style={[styles.button, styles.acceptButton]}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.denyButton]}>
                    <Text style={styles.buttonText}>Deny</Text>
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
                style={[styles.button, styles.addFriendButton]}
                onPress={() => addFriendFunc(item)}
              >
                <Text style={styles.buttonText}>{friendStatus[item]}</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.friendsContainer}>
          <Text style={styles.friendsTitle}>My Friends</Text>
          <ScrollView>
            {friendUsernames.length > 0 ? (
              friendUsernames.map((username, index) => (
                <View key={index} style={styles.friendItem}>
                  <Text style={styles.friendName}>{username}</Text>
                  <TouchableOpacity style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noFriendsText}>No friends yet</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
//------------------------------------------------------------------------------------------------------------------------
const styles = StyleSheet.create({
  friendsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  friendName: {
    color: "#fff",
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noFriendsText: {
    color: "#fff",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    backgroundColor: "#0a0a0a",
  },
  friendStatusSection: {
    marginBottom: 20,
  },
  friendRequestTitle: {
    color: "white",
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  friendRequestItem: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  friendRequestText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#28a745",
    marginRight: 10,
  },
  denyButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  addFriendButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default AddFriend;
