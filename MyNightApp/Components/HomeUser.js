import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Geolocation from "react-native-geolocation-service";
function HomeUser(props) {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, // Set to false for faster updates
            timeout: 21000,
            maximumAge: 0,
          });
        });

        setLocation(position.coords);
      } catch (error) {
        console.log("Error fetching geolocation:", error);
      }
    };

    const intervalId = setInterval(fetchGeolocation, 500); // Fetch every 3 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Hey</Text>
      {location && (
        <Text>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default HomeUser;
