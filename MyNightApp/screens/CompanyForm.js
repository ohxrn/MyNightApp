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
import MapView, { Marker } from "react-native-maps";
import axios from "axios";

function CompanyForm() {
  const [location, setLocation] = useState(null);
  const [compName, setCompName] = useState("");
  const [compDescription, setCompDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [error, setError] = useState("");

  const [selectedValue, setSelectedValue] = useState("option1");

  const handleGeocode = async () => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: "AIzaSyBpkeReT5KZNMo5_WxaRNJepGtDAu8nrG4",
          },
        }
      );

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry.location;
        setLocation({ latitude: lat, longitude: lng });
        setError("");
      } else {
        setLocation(null);
      }
    } catch (error) {
      console.error("Error converting address:", error);
      setError("could not convert");
    }
  };

  const handleAddressChange = (value) => {
    setAddress(value);
  };

  const handleCompany = async () => {
    //
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: "AIzaSyBpkeReT5KZNMo5_WxaRNJepGtDAu8nrG4",
          },
        }
      );

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        setLatitude(location.lat);
        setLongitude(location.lng);
      }
    } catch (error) {
      console.error("Error converting address:", error);
    }

    //

    const companiesRef = ref(db, "company"); // Reference to the "company" location
    const newCompanyRef = push(companiesRef); // Generate a new child location with a unique key
    const newCompanyId = newCompanyRef.key;
    set(newCompanyRef, {
      companyName: compName,
      description: compDescription,
      businessType: selectedValue,
      longitude: longitude,
      latitude: latitude,
    })
      .then(() => {
        alert("data has been sent");
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
        <View style={{ marginTop: 35 }}>
          <TextInput
            value={address}
            onChangeText={(e) => {
              setAddress(e);
            }}
            placeholder="Insert Business address here"
          />
          <TouchableOpacity onPress={handleGeocode}>
            <Text>Find Location</Text>
            <Text>{error}</Text>
          </TouchableOpacity>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825, // Default latitude
              longitude: -122.4324, // Default longitude
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {location && (
              <Marker coordinate={location} title="Selected Location" />
            )}
          </MapView>
        </View>

        <View style={{ width: 375, alignContent: "center" }}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedValue(itemValue)
            }
          >
            <Picker.Item label="Bar" value="Bar" />
            <Picker.Item label="Club" value="Club" />
            <Picker.Item label="Concert Venue" value="Concert venue" />
            <Picker.Item label="Special Event" value="Special Event" />
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
  map: { width: 200, height: 300 },
});

export default CompanyForm;
