import React, { useState, useEffect } from "react";
import {
  scheduleNotificationAsync,
  getPermissionsAsync,
} from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import io from "socket.io-client";
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
import {
  ref,
  onValue,
  runTransaction,
  push,
  set,
  update,
} from "firebase/database";
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

const HomeScreen = ({ BACKGROUND_FETCH_TASK }) => {
  MapboxGL.setAccessToken(
    "sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"
  );

  const [add, setAdd] = useState(0);
  const styleURL = "mapbox://styles/ohxrn/cllmlwayv02jj01p88z3a6nv4";
  const [notiName, setNotiName] = useState([]);
  const [oGName, setOGName] = useState();
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
  const [socketRoom, setSocketRoom] = useState(false);
  const [socketWelcome, setSocketWelcome] = useState("");
  const [line, setLine] = useState([]);

  //
  async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });
  }

  //------------------------------[[[[[[[[SOCKET ROOM]]]]]]]]]]]--------------------------------------------------

  useEffect(() => {
    if (socketRoom) {
      const socket = io("https://2606-73-47-230-127.ngrok-free.app");
      socket.on("serverEnterRoom", (data) => {
        console.log("HERE DATA", data);
        setSocketWelcome(data);
      });

      socket.emit("buttonMessage", auth.currentUser?.email);

      return () => {
        // Clean up the socket connection when the socketRoom value changes
        socket.disconnect();
      };
    }
  }, [socketRoom]);

  //------------------------------[[[[[[[[ SOCKET ROOM]]]]]]]]]]]--------------------------------------------------

  useEffect(() => {
    // console.log("THIS IS THE JSON", JSON.stringify(geoJSON));
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

  // //send to Mapbox---------------------------------------------------------------------
  // const viewDataset = async () => {
  //   const datasetID = "clloddi6500xe2cp0m7oal19b"; // Replace with your dataset ID
  //   const accessToken =
  //     "sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"; // Replace with your Mapbox access token

  //   try {
  //     const response = await fetch(
  //       "https://api.mapbox.com/datasets/v1/ohxrn/clloddi6500xe2cp0m7oal19b/features/fad29966a10b68d7a7937fd54b033fb1?access_token=sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"
  //     );

  //     if (!response.ok) {
  //       throw new Error(
  //         `Network response was not ok. Status: ${response.status}`
  //       );
  //     }

  //     const data = await response.json();
  //     // console.log("Dataset:", data);
  //   } catch (error) {
  //     console.error("Error fetching dataset:", error);
  //   }
  // };

  // useEffect(() => {
  //   viewDataset();
  // }, [geoJSON]);

  const lineCalulcation = (data, id) => {
    console.log("THIS IS ID", id);
    console.log(data.length);
    let latSum = 0;
    let longSum = 0;
    const last5Pings = data.slice(-5); // Get the last 10 pings

    if (last5Pings.length > 0) {
      // Calculate weights for each ping, giving more weight to recent pings
      const weights = Array.from(
        { length: last5Pings.length },
        (_, i) => i + 1
      );

      // Calculate the sum of weights for normalization
      const weightSum = weights.reduce((sum, w) => sum + w, 0);

      for (let i = 0; i < last5Pings.length; i++) {
        const weight = weights[i] / weightSum; // Normalize weights
        latSum += last5Pings[i][0] * weight;
        longSum += last5Pings[i][1] * weight;
      }

      let differenceLat = latestLocation.latitude - latSum;
      let differenceLong = latestLocation.longitude - longSum;
      let finalDistance = (differenceLat + differenceLong) / 2;

      // Adjust the threshold as needed
      if (finalDistance < 0.000002 && finalDistance > -0.000002) {
        console.log("You are still in line");
        setAdd(add + 1);
        console.log("TRIGGA", add);
        if (add >= 3) {
          setAdd(0);

          const lineRef = ref(db, `company/${id}/line`);

          runTransaction(lineRef, (currentLine) => {
            let number = 0;
            if (!currentLine) {
              // If "line" data doesn't exist, initialize it with a value of 0

              return number;
            }

            // Increment the "line" field by 1
            return number + 1;
          })
            .then(() => {
              console.log("line updated");
            })
            .catch((error) => {
              console.log(error);
              alert(error);
            });
        }
      } else {
        console.log("NOT IN LINE ANYMORE");
      }
      console.log("DISTANCE DIFFERENCE", finalDistance);
    }
  };

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
      console.log(companyRef);
      runTransaction(companyRef, (currentData) => {
        if (currentData !== null) {
          const isWithinRange = distance < 0.182;

          if (isWithinRange) {
            setSocketRoom(true);
            setLine([
              ...line,
              [latestLocation.latitude, latestLocation.longitude],
            ]);
            lineCalulcation(line, companyId);
          }

          console.log(isWithinRange);
          const shouldUpdate = isWithinRange && !currentData.updateTriggered;
          const shouldDecrement = !isWithinRange && currentData.updateTriggered;
          if (shouldUpdate) {
            sendPushNotification(currentData);
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

  const sendPushNotification = async (data) => {
    const { status } = await getPermissionsAsync();
    // setNotiName(push(data.companyName));
    console.log(notiName);

    if (status !== "granted") {
      console.error("Permission to send push notifications denied.");
      return;
    }

    const notificationContent = {
      title: `You are near ${data.companyName}!`,
      body: `there are currently ${data.people} person here.`,
    };

    await scheduleNotificationAsync({
      content: notificationContent,
      trigger: null,
    });
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
  //---------------------------------------[[[[[[[[[[[THE CODE FOR HEATMAP FAILURE]]]]]]]]]]]--------------------------------------
  // const generateUniqueId = () => {
  //   return uuid.v4();
  // };

  // useEffect(() => {
  //   const geojsonData = {
  //     type: "FeatureCollection",
  //     features: ulData.map((data) => ({
  //       type: "Feature",
  //       geometry: {
  //         type: "Point",
  //         coordinates: [data.location.longitude, data.location.latitude],
  //       },
  //       properties: {
  //         id: generateUniqueId(),
  //         name: "Examples" + generateUniqueId(),
  //       },
  //       description: "the first data upload",
  //     })),
  //   };

  //   setGeoJSON(geojsonData);
  // }, [ulData]);

  // useEffect(() => {
  //   if (geoJSON !== undefined) {
  //     setFinalJSON(true);
  //     // console.log("GeoJSON:", JSON.stringify(geoJSON, null, 2));
  //   }
  // }, [geoJSON, ulData, dbLocationID, fsLocation]);
  //---------------------------------------[[[[[[[[[[[THE CODE FOR HEATMAP FAILURE]]]]]]]]]]]--------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <MapboxGL.MapView
          style={styles.mapContainer}
          styleURL={styleURL}
          attributionEnabled={false}
        >
          <View style={{ display: "flex" }}>
            <Text
              style={{
                textAlign: "center",
                color: "black",
                backgroundColor: "white",
                height: 22,
              }}
            >
              Welcome, {auth.currentUser?.email}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                width: "30%",
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
              onPress={signOut}
            >
              <Text style={{ fontSize: 20 }}>Sign Out</Text>
            </TouchableOpacity>
            <Text>Powered by OHXRN X Virtual Vintage LLC</Text>

            <Text style={{ color: "black" }}>{socketWelcome}</Text>
          </View>
          <MapboxGL.Camera
            zoomLevel={14.5}
            centerCoordinate={
              latestLocation !== null
                ? [latestLocation.longitude, latestLocation.latitude]
                : [-71.0589, 42.3601]
            }
            pitch={34}
            animationMode={"flyTo"}
            animationDuration={7000}
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
                <Text style={{ color: "red" }}>
                  {data.people == 1 ? (
                    <Text>1 person here</Text>
                  ) : (
                    <Text>{data.people} people here</Text>
                  )}
                </Text>
                <Text style={{ color: "red" }}>
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
    width: "100%",
  },
});
