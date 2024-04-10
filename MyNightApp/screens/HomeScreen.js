import React, { useState, useEffect } from "react";

import { Threebox } from "threebox";
import * as THREE from "three";

import { ModelLayer } from "@rnmapbox/maps";
import { serverTimestamp } from "firebase/database";
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
import { Ionicons } from "@expo/vector-icons";
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
  FlatList,
} from "react-native";

import theLogo from "../assets/MNLOGO.png";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  ref,
  onValue,
  remove,
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
  const [inLine, setInLine] = useState(false);
  const [trim, setTrim] = useState();
  const [expanded, setExpanded] = useState(false);
  const [expanded1, setExpanded1] = useState(false);
  const [companyVerification, setCompanyVerification] = useState();
  const [temporaryLineTrigger, setTemporaryLineTrigger] = useState(false);
  const [temporaryDecrease, setTemporaryDecrease] = useState(false);
  const [lineUpdated, setLineUpdated] = useState(false);
  const [temporaryMarker, setTemporaryMarker] = useState(false);
  const [groupName, setGroupName] = useState();
  const [groupTrigger, setGroupTrigger] = useState(false);
  const [friendData, setFriendData] = useState({});
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
  const [virtualProxy, setVirtualProxy] = useState(false);
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
  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 7 }}>
      <Text style={{ backgroundColor: "white", padding: 10 }}>
        {item.username}
      </Text>
    </View>
  );
  const renderItem1 = ({ item }) => (
    <View style={{ marginBottom: 7 }}>
      <Text style={{ backgroundColor: "white", padding: 10 }}>
        {item.companyName}
      </Text>
    </View>
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [zoomLevel, setZoomLevel] = useState();

  const mapRef = useRef(null);

  const [fadeAnim] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  const toggleExpand1 = () => {
    setExpanded1(!expanded1);
  };
  const fetchZoomLevel = async () => {
    if (mapRef && mapRef.current) {
      // Add a null check for mapRef
      let zoom = await mapRef.current.getZoom();
      // console.log(zoom); // You can log the zoom level here if needed
      if (zoom > 18.2) {
        setTrim(170);
      } else if (zoom < 18.19 && zoom > 16) {
        setTrim(85);
      } else if (zoom < 15.99 && zoom > 12) {
        setTrim(50);
      } else {
        setTrim(30);
      }
    }
  };
  //
  useEffect(() => {
    const fetchZoomLevel = async () => {
      if (mapRef && mapRef.current) {
        // Add a null check for mapRef
        let zoom = await mapRef.current.getZoom();
        console.log(zoom); // You can log the zoom level here if needed
        // setZoomLevel(zoom);
      }
    };

    // Delay the execution of fetchZoomLevel by a small interval
    const delay = setTimeout(fetchZoomLevel, 100); // Adjust the delay as needed

    return () => clearTimeout(delay); // Clear the timeout when the component unmounts
  }, [mapRef]);
  //
  //------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        const retrieveFriendData = ref(
          db,
          `User Data/${auth.currentUser?.uid}/friends`
        );

        const snapshot = await get(retrieveFriendData);
        const data = snapshot.val();

        if (data) {
          const friendIds = Object.values(data);

          const locationPromises = friendIds.map((friendId) =>
            get(ref(db, `userLocation/${friendId}/location`))
              .then((locationSnapshot) => ({
                friendId,
                locationData: locationSnapshot.val(),
              }))
              .catch((error) => {
                console.error(
                  "Error retrieving locations for friend ID",
                  friendId,
                  ":",
                  error
                );
                return { friendId, locationData: null };
              })
          );

          const usernamePromises = friendIds.map((friendId) =>
            get(ref(db, `User Data/${friendId}`))
              .then((snapshot) => ({
                friendId,
                userData: snapshot.val(),
              }))
              .catch((error) => {
                console.error(
                  "Error retrieving user data for friend ID",
                  friendId,
                  ":",
                  error
                );
                return { friendId, userData: null };
              })
          );

          const locationResults = await Promise.all(locationPromises);
          const usernameResults = await Promise.all(usernamePromises);

          const mergedData = [];
          locationResults.forEach(({ friendId, locationData }) => {
            const { username, ...userData } = usernameResults.find(
              (result) => result.friendId === friendId
            )?.userData;
            if (username) {
              mergedData.push({
                ...userData,
                username,
                location: locationData,
              });
            }
          });

          setFriendData(mergedData);
        }
      } catch (error) {
        console.error("Error retrieving friend data:", error);
      }
    };

    const intervalId = setInterval(fetchFriendData, 6000); // Call fetchFriendData every 6 seconds

    // Cleanup function to clear the interval when the component unmounts or when the useEffect runs again
    return () => clearInterval(intervalId);
  }, []);
  //-------------------------------------------------------------------------------------------------------------------------
  const cubeRef = useRef();
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 19000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const retrieveUserData = (array) => {
    const userRef = ref(db, "User Data");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  };

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
    const socket = io("https://e747755d2664.ngrok.app");
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
        const timeStamp = serverTimestamp();

        set(newLocoRef, {
          location: latestLocation,
          timeStamp: timeStamp,
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
        const timeStamp = serverTimestamp();
        set(locationRef, {
          location: latestLocation,
          timeStamp: timeStamp,
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
    const intervalId = setInterval(() => {
      // Fetch and update location
      getLocation();

      // Fetch new data and calculate distances if location and data are available
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
            // console.log("THIS IS BEING SENT", distance);
            handleUpdate(item.companyId, distance);
          }
        }

        setFinalRender(calculatedObject);
        setShowAnimate(false);
      }
    }, 2000); // Fetch location and data every 5 seconds

    // Clean up the interval when the component unmounts or when dependencies change
    return () => clearInterval(intervalId);
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

  const lineCalulcation = async (data, id, userData) => {
    const latSum = data.slice(-5).reduce((sum, ping) => sum + ping[0], 0);
    const longSum = data.slice(-5).reduce((sum, ping) => sum + ping[1], 0);

    const latAverage = latSum / 5;
    const longAverage = longSum / 5;

    const differenceLat = latestLocation.latitude - latAverage;
    const differenceLong = latestLocation.longitude - longAverage;
    const finalDistance = Math.sqrt(
      Math.pow(differenceLat, 2) + Math.pow(differenceLong, 2)
    ); // Euclidean distance

    if (finalDistance < 0.00002 && finalDistance > -0.00002) {
      console.log("PINGED---here is proxy", proxy);
      console.log(finalDistance);
      setAdd((prevAdd) => prevAdd + 1);
      if (add >= 2 && temporaryLineTrigger === false) {
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

          // console.log("Line updated successfully", updated);
        } catch (error) {
          console.log("Error updating line:", error);
          alert(error);
        }
      }
    } else {
      console.log("NOT IN LINE ANYMORE. Distance is:", finalDistance);
      setAdd(0);
      setTemporaryLineTrigger(false);
      const lineRef = ref(db, `company/${id}/line`);

      try {
        if (temporaryLineTrigger == true) {
          const snapshot = await get(lineRef);
          const currentLine = snapshot.val();

          const updated = currentLine - 1;
          await set(lineRef, updated);
          setTemporaryLineTrigger(false);
        }
      } catch (error) {
        console.log("Error updating line:", error);
        alert(error);
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
  const updateTimeout = {};
  //----------------------------------------------------------------------------------------------------

  const handleUpdate = (companyId, distance) => {
    clearTimeout(updateTimeout[companyId]);

    // Set a new timeout for this specific call
    updateTimeout[companyId] = setTimeout(() => {
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
            // console.log(companyRef);
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

                const shouldUpdate =
                  isWithinRange && proxy == 0 && virtualProxy == false;
                // console.log(
                //   "TEST IF SHOULD UPDATE",
                //   shouldUpdate,
                //   isWithinRange
                // );
                if (shouldUpdate) {
                  sendPushNotification(currentData);
                  setCompanyVerification(companyId);
                  const newEnteredValue = 1;
                  update(userRef, { entered: newEnteredValue })
                    .then(() => {
                      setVirtualProxy(true);
                      console.log(
                        `${auth.currentUser?.uid} is in ${companyRef}`
                      );
                      setProxy(newEnteredValue);
                      setInLine(true); // Update state if the database update is successful
                    })
                    .catch((error) => {
                      console.error("Error updating entered value:", error);
                    });

                  return {
                    ...currentData,
                    people: currentData.people + 1,
                  };
                }
                const shouldDecrement =
                  !isWithinRange &&
                  proxy === 1 &&
                  companyVerification == companyId;
                console.log(
                  "SHOUD DECREASE?",
                  shouldDecrement,
                  companyId,
                  companyVerification
                );
                console.log(isWithinRange);
                if (shouldDecrement) {
                  setVirtualProxy(false);
                  const newEnteredValue = 0;
                  // console.log("Setting entered to 0...");
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

      ref={(ref) => {
        mapRef.current = ref;
      }}
      style={{ flex: 1 }}
      styleURL={styleURL}
      attributionEnabled={false}
      gestureEnabled={true}
      onRegionDidChange={fetchZoomLevel()}
    >
      <View
        style={{
          position: "absolute",
          right: 16,
          top: "10%",
          backgroundColor: "rgba(128, 0, 160, 0.7)",
          borderRadius: 20,
          paddingVertical: 15,
          paddingHorizontal: 10,
        }}
      >
        <View style={styles.background}>
          <TouchableOpacity
            onPress={toggleExpand}
            style={styles.touchableOpacity}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={expanded ? "people-outline" : "people-outline"}
                size={28}
                color={"white"}
              />
              <Ionicons
                name={expanded ? "arrow-up" : "chevron-down"}
                size={24}
                color="white"
              />
            </View>
            {expanded && (
              <FlatList
                data={friendData}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.background}>
          <TouchableOpacity
            onPress={toggleExpand1}
            style={styles.touchableOpacity}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={expanded ? "business" : "business"}
                size={28}
                color={"white"}
              />
              <Ionicons
                name={expanded1 ? "arrow-up" : "chevron-down"}
                size={24}
                color="white"
              />
            </View>
            {expanded1 && (
              <FlatList
                data={finalRender}
                renderItem={renderItem1}
                keyExtractor={(item) => item.id}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <MapboxGL.Camera
        zoomLevel={18.8}
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

      {friendData.length > 0 && friendData.location !== null && (
        <>
          {friendData.map((friend) => (
            <MarkerView
              key={friend.id} // Use a unique identifier as the key
              allowOverlap={true}
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
              key={`marker-${data.companyId}`} // Use a unique identifier as the key
              allowOverlap={true}
              style={{}}
              zIndex={1}
              coordinate={[data.address.longitude, data.address.latitude]}
            >
              <View
                style={{
                  width: trim,
                  height: trim,
                  backgroundColor: "rgba(0, 0, 255, 0.5)", // Blue color with 50% opacity
                  padding: 10,
                  borderRadius: 30, // Half of your width and height for a perfect circle
                  borderWidth: 2, // Border width
                  borderColor: "white",
                }}
              >
                <Image
                  source={theLogo}
                  style={{
                    position: trim < 55 ? "absolute" : null,
                    top: trim < 55 ? 8 : null,
                    right: trim < 55 ? -7 : null,
                    width: trim < 55 ? trim / 0.78 : trim / 3,
                    height: trim < 55 ? trim / 2 : trim / 3,
                  }}
                />
                {trim > 55 ? (
                  <View>
                    <Text style={{ color: "white", fontSize: trim / 6 }}>
                      {data.companyName}
                    </Text>
                    <Text style={{ color: "red", fontSize: trim / 8 }}>
                      {data.people == 1 ? (
                        <Text>1 person here</Text>
                      ) : (
                        <View
                          style={{
                            flexDirection: "row", // Display children components horizontally
                            alignItems: "center", // Align children components vertically at the center
                          }}
                        >
                          <Ionicons name={"person"} size={17} color="white" />
                          <Text
                            style={{
                              fontSize: trim > 85 ? 18 : 11,
                              marginLeft: 5,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {data.people}
                          </Text>
                        </View>
                      )}
                    </Text>
                  </View>
                ) : null}

                {trim > 85 ? (
                  <Text style={{ color: "red" }}>
                    {data.distance.toFixed(2)} Miles away
                  </Text>
                ) : null}
                {trim > 85 ? (
                  <Text
                    style={{ fontSize: 12, fontWeight: "bold", color: "lime" }}
                  >
                    {data.line} In Line
                  </Text>
                ) : null}
              </View>
            </MarkerView>
          ))}
        </>
      )}
      {latestLocation != null ? (
        <ModelLayer
          id="mvl"
          source={{ uri: "../assets/McLaren.glb" }} // Replace with the path to your 3D model file
          layerIndex={5} // Set the layer index appropriately
          scale={10} // Adjust the scale of your model if necessary
          coordinate={[latestLocation.longitude, latestLocation.latitude]}
          // Other props like rotation, position, etc., can also be provided
        />
      ) : (
        <></>
      )}

      <Animated.View style={{}}></Animated.View>
    </MapboxGL.MapView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  background: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 10,
    marginBottom: 8,
  },
  touchableOpacity: {
    padding: 8,
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
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
