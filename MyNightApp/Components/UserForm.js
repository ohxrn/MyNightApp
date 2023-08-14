import React, { useState } from "react";
import { View, StyleSheet, TextInput, Button } from "react-native";

import {
  Database,
  firebase,
  getDatabase,
  ref,
  set,
  push,
  child,
} from "firebase/database";
import { db } from "./Config";

function UserForm(props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const create = () => {
    const newKey = push(child(ref(db), "users")).key;
    set(ref(db, "users/" + newKey), {
      firstName: firstName,
      lastName: lastName,
    })
      .then(() => {
        alert("data updated");
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="insert first name"
        value={firstName}
        onChangeText={(text) => {
          setFirstName(text);
        }}
      ></TextInput>
      <TextInput
        placeholder="insert last name"
        value={lastName}
        onChangeText={(text) => {
          setLastName(text);
        }}
      ></TextInput>
      <Button title="submit data" onPress={create} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default UserForm;
