import React, { useEffect, useState } from "react";
import { FirebaseApp } from "firebase/app";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { push, set, ref } from "firebase/database";
import { db } from "../Components/Config";

function CompanyForm(props) {
  const [compName, setCompName] = useState("");

  const handleCompany = () => {
    const companiesRef = ref(db, "company"); // Reference to the "company" location
    const newCompanyRef = push(companiesRef); // Generate a new child location with a unique key
    const newCompanyId = newCompanyRef.key;
    set(newCompanyRef, {
      companyName: compName,
    })
      .then(() => {
        alert("data updated");
      })
      .catch((error) => {
        alert(error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TextInput
          value={compName}
          onChangeText={(e) => {
            setCompName(e);
          }}
          placeholder="Company Name"
        />
        <TouchableOpacity onPress={handleCompany}>
          <Text>Create Company</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default CompanyForm;
