import React, { useState, useEffect } from "react";
import { ModelLayer } from "@rnmapbox/maps";

import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import theLogo from "../assets/MNLOGO.png";
import * as Animatable from "react-native-animatable";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  ref,
  onValue,
  update,
  runTransaction,
  push,
  set,
} from "firebase/database";
import "firebase/database"; // Import the database module explicitly
import { getDatabase, ServerValue } from "firebase/database";

import MapboxGL, { MarkerView } from "@rnmapbox/maps";

const HomeScreen = () => {
  MapboxGL.setAccessToken(
    "pk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xsbDB6Yzd5MjFxajNmcGoxMTdmeGlobSJ9.ltqRaN4YdVsVZmm5mdHr8g"
  );

  const styleURL = "mapbox://styles/ohxrn/cllmlwayv02jj01p88z3a6nv4";
  const [dbLocationID, setFireBaseLocationID] = useState("");
  const [fsLocation, setFSLocation] = useState(false);
  const [theLoader, setTheLoader] = useState("");
  const [mapUpdate, setMapUpdate] = useState("");
  const [showAnimate, setShowAnimate] = useState(true);
  const [dataArr, setDataArr] = useState([]);
  const [latestLocation, setLatestLocation] = useState(null);
  const [finalRender, setFinalRender] = useState([]);
  const db = getDatabase();
  const { StyleURL } = MapboxGL;

  useEffect(() => {
    let timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (fsLocation == false) {
        const locoID = ref(db, "userLocation"); // Reference to the "company" location
        const newLocoRef = push(locoID); // Generate a new child location with a unique key
        const newCompanyId = newLocoRef.key;
        set(newLocoRef, {
          location: latestLocation,
        })
          .then(() => {
            console.log("original location sent to Firestone");
            setFireBaseLocationID(newCompanyId);
          })
          .catch((error) => {
            alert(error);
          });
        setFSLocation(true);
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [latestLocation]);

  //
  useEffect(() => {
    if (dbLocationID !== null && fsLocation === true) {
      let timeoutId;
      timeoutId = setTimeout(() => {
        const locationRef = ref(db, "userLocation/" + dbLocationID);

        set(locationRef, {
          location: latestLocation,
        })
          .then(() => {
            console.log("Location data updated successfully");
          })
          .catch((error) => {
            console.error("Error updating location data: ", error);
          });
        clearTimeout(timeoutId);
      }, 6000); // 1 second (adjust as needed)
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [latestLocation]);

  //

  //

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
      setShowAnimate(false);
      // setTheLoader("0")
      // setTheHeight(0)
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
    // if (total > 2000) {
    //   setMapUpdate(
    //     alert("You are out of range. Version 1 only released to Boston area.")
    //   );
    // }
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

  // useEffect(() => {
  //   if (latestLocation) {
  //     console.log(
  //       "MY LOCATION:",
  //       `Latitude: ${latestLocation.latitude.toFixed(
  //         8
  //       )}, Longitude: ${latestLocation.longitude.toFixed(8)}`
  //     );
  //   }
  // }, [latestLocation]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      getLocation(); // Fetch location on interval
    }, 8000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once
  let updateTimeout;
  const handleUpdate = (companyId, distance) => {
    clearTimeout(updateTimeout);

    updateTimeout = setTimeout(() => {
      const companyRef = ref(db, "company/" + companyId);
      runTransaction(companyRef, (currentData) => {
        if (currentData !== null) {
          const isWithinRange = distance < 0.1;
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
          // console.log("Update successful");
        })
        .catch((error) => {
          console.log("Update failed:", error);
        });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Sign out" onPress={signOut} />
      <Text style={{ color: "white" }}>Welcome, {auth.currentUser?.email}</Text>

      <View style={styles.container}>
        <MapboxGL.MapView
          style={styles.mapContainer}
          styleURL={styleURL}
          attributionEnabled={false}
        >
          <MapboxGL.Camera
            zoomLevel={13}
            centerCoordinate={[-71.0589, 42.3601]}
            pitch={34}
            animationMode={"flyTo"}
            animationDuration={6000}
          />
          <MapboxGL.PointAnnotation
            id="marker"
            coordinate={[-71.0589, 42.3601]}
          />
          <ActivityIndicator
            style={styles.animate}
            animating={showAnimate}
            size={"large"}
            color={"blue"}
          />
          {finalRender.map((data) => (
            <View key={`marker-view-${data.companyId}`}>
              <MarkerView
                key={`marker-${data.companyId}`}
                coordinate={[data.address.longitude, data.address.latitude]}
              >
                <TouchableOpacity
                  onPress={() => {
                    alert(data.description);
                  }}
                >
                  <Image source={theLogo} style={{ width: 60, height: 60 }} />
                </TouchableOpacity>
                <Text style={{ color: "white" }}>{data.companyName}</Text>
                <Text style={{ color: "white" }}>
                  {data.people} Person here
                </Text>
                <Text style={{ color: "white" }}>
                  {data.distance.toFixed(2)} Miles away
                </Text>
              </MarkerView>
            </View>
          ))}
          {/* {console.log(latestLocation)} */}
          {latestLocation !== null && (
            <MarkerView
              key="currentLocationMarker"
              coordinate={[latestLocation.longitude, latestLocation.latitude]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Image
                source={{ uri: "https://i.imgur.com/E1iHHaQ.png" }}
                style={{ width: 20, height: 20 }}
              />
            </MarkerView>
          )}
        </MapboxGL.MapView>
      </View>

      <Text>{mapUpdate}</Text>

      {/* {finalRender.map((data) => (
        <View key={data.companyId}>
          <Text>{data.companyName}</Text>
          <Text>{data.description}</Text>
          <Text>{data.distance} Miles</Text>
          <Text>{data.people} People</Text>
        </View>
      ))} */}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  animate: {
    flex: 0,
    margin: 50,
    width: "100%",
  },
  mapContainer: {
    flex: 1,
    width: "100%", // Add this line to make the map container take up the entire width
  },
});
