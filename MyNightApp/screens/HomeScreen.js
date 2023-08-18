import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, SafeAreaView } from "react-native";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { getDatabase, ref, onValue } from "firebase/database";
import { db } from "../Components/Config";

const HomeScreen = () => {
  const [dataArr, setDataArr] = useState([]);
  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, "company");

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      const newDataArray = [];

      for (const postId in postsData) {
        const post = postsData[postId];
        newDataArray.push(post);
      }

      setDataArr(newDataArray); // Update the state with the retrieved data
    });

    return () => {
      // Unsubscribe the listener when the component unmounts
      unsubscribe();
    };
  }, []);

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
    <SafeAreaView>
      {dataArr.map((data, index) => (
        <Text key={index}>{JSON.stringify(data)}</Text>
      ))}
      <Text>Welcome, {auth.currentUser?.email}</Text>
      <Button title="Sign out" onPress={signOut} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
