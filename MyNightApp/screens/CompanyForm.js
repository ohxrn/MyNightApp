import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Label } from "react-native-paper";
import { push, set, ref } from "firebase/database";
import { db } from "../Components/Config";

function CompanyForm(props) {
  const [compName, setCompName] = useState("");
  const [compDescription, setCompDescription] = useState("");
  const [selectedValue, setSelectedValue] = useState("option1");

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
      <View style={styles.container}>
        <TextInput
          value={compName}
          onChangeText={(e) => {
            setCompName(e);
          }}
          placeholder="Company Name"
        />
        <TextInput
          value={compDescription}
          onChangeText={(e) => {
            setCompDescription(e);
          }}
          placeholder="Description"
        />

        <View style={{ width: 375, alignContent: "center" }}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            <Picker.Item label="Bar" value="option1" />
            <Picker.Item label="Club" value="option2" />
            <Picker.Item label="Concert Venue" value="option3" />
            <Picker.Item label="Special Event" value="option4" />
          </Picker>
        </View>
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
