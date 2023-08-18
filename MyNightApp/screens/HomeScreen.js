import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, SafeAreaView } from "react-native";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { ref, onValue, update, runTransaction } from "firebase/database";
import "firebase/database"; // Import the database module explicitly
import { getDatabase, ServerValue } from "firebase/database";

const HomeScreen = () => {
  const [updateTriggered, setUpdateTriggered] = useState(false); // Add this state
  const [amount, setAmount] = useState(null);
  const [dataArr, setDataArr] = useState([]);
  const [latestLocation, setLatestLocation] = useState(null);
  const [finalRender, setFinalRender] = useState([]);
  const db = getDatabase();
  useEffect(() => {
    const postsRef = ref(db, "company");

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      const newDataArray = [];

      snapshot.forEach((childSnapshot) => {
        const companyId = childSnapshot.key; // Get the unique key (companyId)
        const companyData = childSnapshot.val();
        newDataArray.push({ companyId, ...companyData }); // Include the key along with the data
      });

      setDataArr(newDataArray); // Update state after processing all posts
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (latestLocation && dataArr.length > 0) {
      const calculatedObject = [];

      for (const item of dataArr) {
        if (item.address) {
          const distance = calculateDistance(
            latestLocation.latitude,
            latestLocation.longitude,
            item.address.latitude,
            item.address.longitude
          );

          calculatedObject.push({ ...item, distance });
          handleUpdate(item.companyId, distance); // Check if this line gets executed
        }
      }

      setFinalRender(calculatedObject);
    }
  }, [latestLocation, dataArr]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 3958.8; // Radius of the Earth in miles
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;
    const latDiff = lat2Rad - lat1Rad;
    const lonDiff = lon2Rad - lon1Rad;
    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const total = earthRadius * c;
    return total;
  };

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
        "MY LOCATION:",
        `Latitude: ${latestLocation.latitude.toFixed(
          8
        )}, Longitude: ${latestLocation.longitude.toFixed(8)}`
      );
    }
  }, [latestLocation]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLocation(); // Fetch location on interval
    }, 8000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once

  const handleUpdate = (companyId, distance) => {
    const companyRef = ref(db, "company/" + companyId);
    runTransaction(companyRef, (currentData) => {
      if (currentData !== null) {
        const isWithinRange = distance < 0.01;
        const shouldUpdate = isWithinRange && !currentData.updateTriggered;
        const shouldDecrement = !isWithinRange && currentData.updateTriggered;

        if (shouldUpdate) {
          return {
            ...currentData,
            people: currentData.people + 1,
            updateTriggered: true,
          };
        }
        if (shouldDecrement) {
          return {
            ...currentData,
            people: currentData.people - 1,
            updateTriggered: false,
          };
        }
      }

      return currentData;
    })
      .then(() => {
        console.log("Update successful");
      })
      .catch((error) => {
        console.log("Update failed:", error);
      });
  };

  return (
    <SafeAreaView>
      <Text>Welcome, {auth.currentUser?.email}</Text>
      <Button title="Sign out" onPress={signOut} />
      {finalRender.map((data) => (
        <View key={data.companyId}>
          <Text>{data.companyName}</Text>
          <Text>{data.description}</Text>
          <Text>{data.distance} Miles</Text>
          <Text>{data.people} People</Text>
        </View>
      ))}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
