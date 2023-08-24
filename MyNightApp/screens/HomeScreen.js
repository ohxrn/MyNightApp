import React, { useState, useEffect } from "react";
import { HeatmapLayer, ModelLayer } from "@rnmapbox/maps";
import uuid from "react-native-uuid";
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
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { ref, onValue, runTransaction, push, set } from "firebase/database";
import "firebase/database"; // Import the database module explicitly
import { getDatabase, ServerValue, getDocs } from "firebase/database";

import MapboxGL, {
  MarkerView,
  addSource,
  Map,
  on,
  collection,
  Layer,
} from "@rnmapbox/maps";

const HomeScreen = () => {
  MapboxGL.setAccessToken(
    "sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"
  );

  const styleURL = "mapbox://styles/ohxrn/cllmlwayv02jj01p88z3a6nv4";
  const [finalJSON, setFinalJSON] = useState(false);
  const [geoJSON, setGeoJSON] = useState();
  const [ulData, setUlData] = useState([]);
  const [dbLocationID, setFireBaseLocationID] = useState("");
  const [fsLocation, setFSLocation] = useState(false);
  const [theLoader, setTheLoader] = useState("");
  const [mapUpdate, setMapUpdate] = useState("");
  const [showAnimate, setShowAnimate] = useState(true);
  const [dataArr, setDataArr] = useState([]);
  const [latestLocation, setLatestLocation] = useState(null);
  const [finalRender, setFinalRender] = useState([]);
  const [jsonData, setJsonData] = useState("");
  const db = getDatabase();
  const { StyleURL } = MapboxGL;

  useEffect(() => {
    console.log("THIS IS THE JSON", JSON.stringify(geoJSON));
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

  //send to Mapbox---------------------------------------------------------------------
  const viewDataset = async () => {
    const datasetID = "clloddi6500xe2cp0m7oal19b"; // Replace with your dataset ID
    const accessToken =
      "sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"; // Replace with your Mapbox access token

    try {
      const response = await fetch(
        "https://api.mapbox.com/datasets/v1/ohxrn/clloddi6500xe2cp0m7oal19b/features/fad29966a10b68d7a7937fd54b033fb1?access_token=sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"
      );

      if (!response.ok) {
        throw new Error(
          `Network response was not ok. Status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Dataset:", data);
    } catch (error) {
      console.error("Error fetching dataset:", error);
    }
  };

  useEffect(() => {
    viewDataset();
  }, [geoJSON]);

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

  useEffect(() => {
    const uLRef = ref(db, "userLocation");
    const theRun = onValue(uLRef, (snapshot) => {
      const newDataArray = [];
      snapshot.forEach((childSnapshot) => {
        const ulData = childSnapshot.val();
        newDataArray.push(ulData);
      });
      setUlData(newDataArray);
    });

    return () => {
      theRun();
    };
  }, []);

  const generateUniqueId = () => {
    return uuid.v4();
  };

  useEffect(() => {
    const geojsonData = {
      type: "FeatureCollection",
      features: ulData.map((data) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [data.location.longitude, data.location.latitude],
        },
        properties: {
          id: generateUniqueId(),
          name: "Examples" + generateUniqueId(),
        },
        description: "the first data upload",
      })),
    };

    setGeoJSON(geojsonData);
  }, [ulData]);

  useEffect(() => {
    if (geoJSON !== undefined) {
      setFinalJSON(true);
      // console.log("GeoJSON:", JSON.stringify(geoJSON, null, 2));
    }
  }, [geoJSON, ulData, dbLocationID, fsLocation]);

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
          <Text>"clloddi6500xe2cp0m7oal19b"</Text>
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
          {latestLocation !== null && (
            <MarkerView
              key="currentLocationMarker"
              coordinate={[latestLocation.longitude, latestLocation.latitude]}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Image
                source={{ uri: "https://i.imgur.com/E1iHHaQ.png" }}
                style={{ width: 60, height: 60 }}
                anchor={[0, 0]}
              />
            </MarkerView>
          )}
        </MapboxGL.MapView>
      </View>

      <Text>{mapUpdate}</Text>
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
