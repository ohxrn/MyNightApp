import React, { useState, useEffect } from "react";

import { Threebox } from "threebox";
import * as THREE from "three";

import { ModelLayer } from "@rnmapbox/maps";

import { GLView } from "expo-gl";
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} from "three";
import {
  scheduleNotificationAsync,
  getPermissionsAsync,
} from "expo-notifications";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { useFocusEffect } from "@react-navigation/native";
import io from "socket.io-client";
import { FillExtrusionLayer, ShapeSource, HeatmapLayer } from "@rnmapbox/maps";

import { useRef } from "react";
import uuid from "react-native-uuid";

import {
  uploadBytesResumable,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import {
  Animated,
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
import { getDatabase, get, ServerValue, getDocs } from "firebase/database";
import { SymbolLayer } from "@rnmapbox/maps";

import MapboxGL, {
  Feature,
  MarkerView,
  addSource,
  Map,
  on,
  collection,
  Layer,
} from "@rnmapbox/maps";

const HomeScreen = ({ BACKGROUND_FETCH_TASK }) => {
  const [temporaryLineTrigger, setTemporaryLineTrigger] = useState(false);
  const [temporaryDecrease, setTemporaryDecrease] = useState(false);
  const [lineUpdated, setLineUpdated] = useState(false);
  const [temporaryMarker, setTemporaryMarker] = useState(false);
  const [groupName, setGroupName] = useState();
  const [groupTrigger, setGroupTrigger] = useState(false);

  const [currentGroup, setCurrentGroup] = useState();
  const [proxyPersonal, setProxyPersonal] = useState(false);
  const [proxy, setProxy] = useState();
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [username, setUsername] = useState();
  const [age, setAge] = useState();
  const [bio, setBio] = useState();
  const [add, setAdd] = useState(0);
  const styleURL = "mapbox://styles/ohxrn/clt4zw51q02j401p6gwi8bm55";
  const [notiName, setNotiName] = useState([]);
  const [oGName, setOGName] = useState();
  const [finalJSON, setFinalJSON] = useState(false);

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
  const [friendsLocations, setFriendsLocations] = useState([]);
  const [friendsMapTrigger, setFriendsMapTrigger] = useState(false);
  const [userData, setUserData] = useState([]);
  const [mapDetails, setMapDetails] = useState([]);

  MapboxGL.setAccessToken(
    "sk.eyJ1Ijoib2h4cm4iLCJhIjoiY2xscG51YjJkMDZndTNkbzJvZmd3MmpmNSJ9.1yj9ewdvaGBxVPF_cdlLIQ"
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(0);
  const onRegionDidChange = async (event) => {
    const currentZoom = await event.target.getZoom();
    setZoomLevel(currentZoom);
  };
  const onMapLoad = () => {
    setIsMapLoaded(true);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const create3DObject = () => {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);

    return cube;
  };
  const cubeRef = useRef();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // useEffect(() => {
  //   const addBuildingSource = async () => {
  //     try {
  //       await new Promise((resolve) => setTimeout(resolve, 1000));

  //       if (isMapLoaded && mapRef.current) {
  //         const geoJSONData = generateGeoJSON();

  //         // Check if mapRef.current has the addSource method
  //         if (
  //           mapRef.current.addSource &&
  //           typeof mapRef.current.addSource === "function"
  //         ) {
  //           mapRef.current.addSource("building", {
  //             type: "geojson",
  //             data: geoJSONData,
  //           });

  //           mapRef.current.addLayer({
  //             id: "building-layer",
  //             type: "fill-extrusion",
  //             source: "building",
  //             paint: layerStyles,
  //           });

  //           // Query features after adding the source
  //           const source = mapRef.current.queryRenderedFeatures({
  //             layers: ["building-layer"],
  //           });
  //           console.log("Rendered features data:", source);
  //         } else {
  //           console.warn(
  //             "Unable to add source: addSource method is not available."
  //           );
  //         }
  //       } else {
  //         console.warn("Map is not yet loaded.");
  //       }
  //     } catch (error) {
  //       console.error("Error logging GeoJSON:", error);
  //     }
  //   };

  //   addBuildingSource();
  // }, [isMapLoaded, mapRef.current]);
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      // console.log("Map is loaded!", mapRef.current);
      // const zoomLevel = mapRef.current.getZoom;
      // console.log("THIS IS ZOOM LEVEL", zoomLevel);
    }
  }, [isMapLoaded, mapRef.current]);

  // const generateGeoJSON = () => {
  //   const features = Object.keys(buildingHeights).map((buildingName) => {
  //     return {
  //       type: "Feature",
  //       properties: {
  //         height: buildingHeights[buildingName],
  //       },
  //       geometry: {
  //         type: "Polygon",
  //         coordinates: [
  //           [
  //             [-71.0589, 42.3601],
  //             // Add more coordinates as needed for the building's footprint
  //           ],
  //         ],
  //       },
  //     };
  //   });

  //   return {
  //     type: "FeatureCollection",
  //     features: features,
  //   };
  // };
  // const [buildingHeights, setBuildingHeights] = useState({
  //   building1: 100,
  //   building2: 150,
  //   // Add more buildings and their heights as needed
  // });
  // const layerStyles = {
  //   fillExtrusionColor: "#aaa",
  //   fillExtrusionHeight: ["get", "height"],
  //   fillExtrusionOpacity: 0.6,
  // };

  // const [buildingData, setBuildingData] = useState({
  //   building1: { height: 900 },
  //   // Add more buildings and their heights as needed
  // });

  //   // ...
  // useEffect(() => {
  //   const logGeoJSON = async () => {
  //     try {
  //       await new Promise((resolve) => setTimeout(resolve, 1000));

  //       // Check if the source is loaded before querying
  //       const map = mapRef.current;
  //       if (map) {
  //         const source = await map.querySourceFeatures("building");
  //         console.log("GeoJSON data:", source);
  //       } else {
  //         console.warn("Building source is not yet loaded.");
  //       }
  //     } catch (error) {
  //       console.error("Error logging GeoJSON:", error);
  //     }
  //   };
  //   logGeoJSON();
  // }, [isMapLoaded, buildingData]);
  // //   //
  //----------------------------------------------------------------------------------------
  // THE MYNIGHTMAPPED ALGORITHM SCALED
  const mergeData = (userData, friendsData) => {
    const mergedData = [];

    for (const userId in userData) {
      const user = userData[userId];
      const friend = friendsData.find((friend) => friend.id === userId);

      if (friend) {
        // Merge user and friend data
        const mergedObject = { id: userId, ...user, ...friend };
        mergedData.push(mergedObject);
      }
    }

    return mergedData;
  };

  const retrieveUserData = (array) => {
    const userRef = ref(db, "User Data");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  };

  useEffect(() => {
    if (userData && friendsLocations.length > 0) {
      const timerId = setTimeout(() => {
        const mergedResult = mergeData(userData, friendsLocations);
        // console.log("HERE IS DATA", mergedResult);
        setMapDetails(mergedResult);
        // console.log(
        //   "DATA HAS BEEN UPDATED------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
        // );
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [userData, friendsLocations]);
  //

  //

  const fetchData = () => {
    const myNightMapReference = ref(db, "userLocation");
    onValue(myNightMapReference, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const usersArray = Object.keys(data).map((userId) => ({
          id: userId,
          ...data[userId],
        }));
        setFriendsLocations(usersArray);
        retrieveUserData();
      }
    });
  };

  //  //------------------------------******************************************------------------------------------------------
  const pingData = (data) => {
    // console.log("This is what we see", data);
    const socket = io("https://e03a908aa9a1.ngrok.app");
    setTimeout(() => {
      socket.emit("joinRoom", { room: data.companyName });
      // Your code to be executed after the delay
    }, 5000);

    // Cleanup function to clear the timer if needed
    return () => {
      clearTimeout(timeoutId);
    };
  };

  //------------------------------[[[[[[[[SOCKET ROOM]]]]]]]]]]]--------------------------------------------------

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
            console.log("original location sent to Firestone", latestLocation);
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

  useEffect(() => {
    if (dbLocationID !== null && fsLocation === true) {
      let timeoutId;
      timeoutId = setTimeout(() => {
        const locationRef = ref(db, "userLocation/" + auth.currentUser?.uid);

        set(locationRef, {
          location: latestLocation,
        })
          .then(() => {
            // console.log("Location data updated successfully");
          })
          .catch((error) => {
            console.error("Error updating location data: ", error);
          });
        clearTimeout(timeoutId);
      }, 6000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [latestLocation]);

  useEffect(() => {
    const postsRef = ref(db, "company");
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      const newDataArray = [];
      snapshot.forEach((childSnapshot) => {
        const companyId = childSnapshot.key;
        const companyData = childSnapshot.val();
        newDataArray.push({ companyId, ...companyData });
      });
      setDataArr(newDataArray);
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

          handleUpdate(item.companyId, distance);
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
    if (total > 2000) {
      setMapUpdate(
        alert("You are out of range. Version 1 only released to Boston area.")
      );
    }
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
      accuracy: Location.Accuracy.Highest,
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

  const lineCalulcation = async (data, id) => {
    // console.log(data.length);
    let latSum = 0;
    let longSum = 0;
    const last5Pings = data.slice(-5);

    if (last5Pings.length > 0) {
      const weights = Array.from(
        { length: last5Pings.length },
        (_, i) => i + 1
      );

      const weightSum = weights.reduce((sum, w) => sum + w, 0);

      for (let i = 0; i < last5Pings.length; i++) {
        const weight = weights[i] / weightSum;
        latSum += last5Pings[i][0] * weight;
        longSum += last5Pings[i][1] * weight;
      }

      let differenceLat = latestLocation.latitude - latSum;
      let differenceLong = latestLocation.longitude - longSum;
      let finalDistance = (differenceLat + differenceLong) / 2;
      //conditional that is triggered if distance between weighted pings is small enough, you're added to firebase in the line queue.
      if (finalDistance < 0.00002 && finalDistance > -0.00002) {
        console.log(
          "You are still in line",
          "DISTANCE:",
          finalDistance,
          "--------------------",
          "ping number",
          add,
          "------------------------------------------------------------------------------------------------------"
        );
        //callback to increment the trigger where after the fourth consecutive ping, you're entered into queue.
        setAdd((prevAdd) => prevAdd + 1);

        if (add >= 4 && !lineUpdated && temporaryLineTrigger == false) {
          setAdd(0);
          setTemporaryLineTrigger(true);
          console.log(
            "You have been in the same spot for 2 minutes, lineTrigger has been set to true."
          );
          const lineRef = ref(db, `company/${id}/line`);

          try {
            const snapshot = await get(lineRef);
            const currentLine = snapshot.val();

            const updated = currentLine + 1;
            await set(lineRef, updated);

            console.log("Line updated successfully", updated);
          } catch (error) {
            console.log("Error updating line:", error);
            alert(error);
          }
        }
      } else {
        console.log("NOT IN LINE ANYMORE. DIstance is:", finalDistance);
        setAdd(1);
        setTemporaryLineTrigger(false);
      }
    }
  };
  //----------------------------------------------------------------------------------------------------
  useEffect(() => {
    getLocation();
    const intervalId = setInterval(() => {
      getLocation();
      fetchData();
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);
  let updateTimeout;
  //----------------------------------------------------------------------------------------------------

  const handleUpdate = (companyId, distance) => {
    clearTimeout(updateTimeout);

    updateTimeout = setTimeout(() => {
      const uid = auth.currentUser?.uid;
      const database = getDatabase();
      const userRef = ref(database, `User Data/${uid}`);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            // console.log("User data: ", userData);

            // Set your state values based on the retrieved data
            setFName(userData.first_name);
            setLName(userData.last_name);
            setUsername(userData.username);
            setAge(userData.age);
            setBio(userData.bio);
            setProxy(userData.entered);

            // Check if entered is 0

            const companyRef = ref(db, "company/" + companyId);
            console.log(companyRef);
            runTransaction(companyRef, (currentData) => {
              if (currentData !== null) {
                const isWithinRange = distance < 0.02;

                if (isWithinRange) {
                  pingData(currentData);
                  if (groupTrigger == false) {
                    setGroupTrigger(true);
                    setCurrentGroup(currentData.companyName);
                    setSocketRoom(true);
                  }
                  setLine([
                    ...line,
                    [latestLocation.latitude, latestLocation.longitude],
                  ]);
                  lineCalulcation(line, companyId);
                }

                // console.log(isWithinRange);
                const shouldUpdate = isWithinRange;
                const shouldDecrement = !isWithinRange && proxy === 1;

                if (shouldUpdate && proxy === 0 && temporaryMarker == false) {
                  setTemporaryMarker(true);
                  setTemporaryDecrease(false);

                  sendPushNotification(currentData);
                  const newEnteredValue = 1;
                  update(userRef, { entered: newEnteredValue })
                    .then(() => {
                      console.log(
                        "User has been added to the database for location"
                      );
                      setProxy(newEnteredValue); // Update state if the database update is successful
                    })
                    .catch((error) => {
                      console.error("Error updating entered value:", error);
                    });

                  return {
                    ...currentData,
                    people: currentData.people + 1,
                  };
                }

                if (shouldDecrement && temporaryDecrease == false) {
                  setTemporaryDecrease(true);
                  setTemporaryMarker(false);
                  const newEnteredValue = 0;
                  console.log("Setting entered to 0...");
                  update(userRef, { entered: newEnteredValue })
                    .then(() => {
                      console.log("Entered value updated in the database.");
                      setProxy(newEnteredValue); // Update state if the database update is successful
                    })
                    .catch((error) => {
                      console.error("Error updating entered value:", error);
                    });

                  return {
                    ...currentData,
                    people: currentData.people - 1,
                  };
                }
              }

              return currentData;
            })
              .then(() => {
                // console.log("Transaction successful");
                // Update the entered value to 1 if it's still 0
              })

              .catch((error) => {
                console.log("Update failed:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }, 2000);
  };
  //----------------------------------------------------------------------------------------------------
  const sendPushNotification = async (data) => {
    const { status } = await getPermissionsAsync();
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
  //----------------------------------------------------------------------------------------------------
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
  //----------------------------------------------------------------------------------------------------
  return (
    <MapboxGL.MapView
      // onRegionDidChange={onRegionDidChange}
      onDidFinishLoadingMap={onMapLoad}
      ref={(ref) => {
        mapRef.current = ref;
      }}
      style={{ flex: 1 }}
      styleURL={styleURL}
      attributionEnabled={false}
      gestureEnabled={true}
    >
      <SafeAreaView>
        <TouchableOpacity
          style={{ backgroundColor: "red", flexDirection: "row" }}
          onPress={signOut}
        >
          <Text>Sign Out</Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 33,
            fontWeight: "900",
            fontStyle: "italic",
            color: "purple",
            textAlign: "center",
            marginTop: 30,
          }}
        >
          My Night
        </Text>
        {/* <ShapeSource id="buildingSource" shape={generateGeoJSON()}>
          <FillExtrusionLayer
            id="building-layer"
            sourceLayerID="building"
            minZoomLevel={15}
            style={layerStyles}
          />
        </ShapeSource> */}
      </SafeAreaView>

      <MapboxGL.Camera
        zoomLevel={20.5}
        centerCoordinate={
          latestLocation !== null
            ? [latestLocation.longitude, latestLocation.latitude]
            : [-71.0589, 42.3601]
        }
        pitch={34}
        animationMode={"flyTo"}
        animationDuration={7000}
      />
      {latestLocation !== null && (
        <MarkerView
          coordinate={[latestLocation.longitude, latestLocation.latitude]}
        >
          <ModelLayer
            tintColor={{ r: 1, g: 0, b: 0, a: 1 }}
            source={{ uri: "../assets/GLman.glb" }}
            layerIndex={1}
            scale={9.1}
            onDidUpdateModel={() => {
              // Handle model update if necessary
            }}
            ref={(ref) => (cubeRef.current = ref)}
          />
        </MarkerView>
      )}
      <ActivityIndicator
        style={styles.animate}
        animating={showAnimate}
        size={"large"}
        color={"pink"}
      />

      {mapDetails.length > 0 && (
        <>
          {mapDetails.map((friend) => (
            <MarkerView
              style={{}}
              zIndex={2}
              allowOverlap={true}
              key={friend.id}
              coordinate={[friend.location.longitude, friend.location.latitude]}
            >
              <Image
                source={require("../assets/MyNightMale.png")}
                style={{ width: 60, height: 60 }}
              />
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  position: "absolute",
                  top: 55,
                  textAlign: "center",
                  left: 10,
                  backgroundColor: "pink",

                  padding: 4,
                }}
              >
                {friend.username}
              </Text>
            </MarkerView>
          ))}
          {finalRender.map((data) => (
            <MarkerView
              allowOverlap={true}
              style={{}}
              zIndex={1}
              key={`marker-${data.companyId}`}
              coordinate={[data.address.longitude, data.address.latitude]}
            >
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 255, 0.5)", // Blue color with 50% opacity
                  padding: 10,
                  borderRadius: 30, // Half of your width and height for a perfect circle
                  borderWidth: 2, // Border width
                  borderColor: "white",
                }}
              >
                <Image source={theLogo} style={{ width: 60, height: 60 }} />
                <Text style={{ color: "white", fontSize: 40 }}>
                  {data.companyName}
                </Text>
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
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", color: "lime" }}
                >
                  {data.line} People in line here
                </Text>
              </View>
            </MarkerView>
          ))}
        </>
      )}
    </MapboxGL.MapView>
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
