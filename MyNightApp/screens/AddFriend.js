import React, { useEffect, useState } from "react";
import { auth } from "../Components/Config";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";

function AddFriend(props) {
  const database = getDatabase();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const userRef = ref(database, `User Data/`);

    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();

        if (userData) {
          const usernames = Object.keys(userData).map(
            (key) => userData[key].username
          );
          setSearchResults(usernames);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filteredUsernames = searchResults.filter((username) =>
      username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredUsernames);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TextInput
          style={styles.searchInput}
          placeholder="Search username..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlatList
          data={searchResults}
          renderItem={({ item }) => <Text>{item}</Text>}
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
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default AddFriend;
