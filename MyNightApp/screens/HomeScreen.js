import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

const HomeScreen = () => {
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
  const [longitude, setLongitude] = useState();
  const [latitude, setLatitude] = useState();
  const [latestLocation, setLatestLocation] = useState(null);

  const getLocation = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return;

    const options = {
      accuracy: Location.Accuracy.High,
      maximumAge: 10,
      timeout: 1000,
    };

    try {
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync(options);

      setLatestLocation({ latitude, longitude });
    } catch (error) {
      console.log("Error fetching geolocation:", error);
    }
  };

  useEffect(() => {
    if (latestLocation) {
      console.log(
        "UPDATED LOCATION:",
        `Latitude: ${latestLocation.latitude.toFixed(
          8
        )}, Longitude: ${latestLocation.longitude.toFixed(8)}`
      );
    }
  }, [latestLocation]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLocation(); // Fetch location on interval
    }, 10000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once
  return (
    <View>
      <Text>Welcome, {auth.currentUser?.email}</Text>
      <Button title="Sign out" onPress={signOut} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
