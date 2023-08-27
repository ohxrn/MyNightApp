import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

//

import { db, auth } from "../Components/Config";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

function UserForm(props) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.replace("HomeScreen");
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

  const handleCompany = () => {
    navigation.replace("CompanyForm");
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
        style={styles.emailInput}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.passwordInput}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text
          style={{
            flex: 1,
            fontWeight: "700",
            color: "white",
            fontSize: 18,
          }}
        >
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={createUser}
        style={[
          styles.registerButton,
          { borderColor: "#0782f9", borderWidth: 2 },
        ]}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: "800",
            color: "#0782f9",
          }}
        >
          Register
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleCompany}
        style={[
          styles.companyButton,
          { borderColor: "#0782f9", borderWidth: 2 },
        ]}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 12,
            fontWeight: "500",
            color: "#0782f9",
          }}
        >
          Join as a company
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emailInput: {
    backgroundColor: "white",
    width: "80%",
    height: 40,
    borderRadius: 7,
    borderWidth: 0.2,
    textAlign: "center",
    margin: 2,
  },
  passwordInput: {
    margin: 10,
    backgroundColor: "white",
    width: "80%",
    height: 40,
    borderRadius: 7,
    borderWidth: 0.2,
    textAlign: "center",
    marginBottom: 33,
  },
  loginButton: {
    paddingTop: 15,
    width: "50%",
    backgroundColor: "#0782f9",
    alignItems: "center",
    borderRadius: 12,
    height: 50,
    marginBottom: 8,
  },
  companyButton: {
    paddingTop: 15,
    width: "30%",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 12,
    height: 50,
    position: "absolute",
    bottom: 140,
  },
  registerButton: {
    paddingTop: 12,
    width: "50%",
    backgroundColor: "white",
    borderColor: "#0782f9",
    alignItems: "center",
    borderRadius: 12,
    height: 50,
  },
});

export default UserForm;
