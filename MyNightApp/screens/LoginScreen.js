import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

//

import { db, auth } from "../Components/Config";
import { useEffect } from "react";

import { useNavigation } from "@react-navigation/core";

function UserForm(props) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate("welcome");
      }
    });
    return unsubscribe;
  }, []);

  const createUser = () => {
    console.log(auth); // Check the auth object in the console
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User successfully created
        const user = userCredential.user;
        console.log("Registered with:", user.email);
      })
      .catch((error) => {
        // Handle error
        console.log("Error creating user:", error);
      });
  };

  const handleLogin = () => {
    auth;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User successfully created
        const user = userCredential.user;
        console.log("Logged in with:", user.email);
      })
      .catch((error) => {
        // Handle error
        console.log("Error creating user:", error);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={createUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default UserForm;
