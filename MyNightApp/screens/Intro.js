import React, { useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Video from "react-native-video";
import { auth } from "../Components/Config";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";

const Intro = () => {
  const [initialRoute, setInitialRoute] = useState("Login");
  const navigation = useNavigation();
  const videoRef = useRef(null);
  // console.log("it has ended");
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setInitialRoute("HomeScreen");
      } else {
        setInitialRoute("Login");
      }
    });
    return unsubscribe;
  }, []);
  const onEnd = () => {
    // Video playback has ended, navigate to the desired screen
    navigation.navigate(initialRoute);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("../assets/MNIB.mp4")}
        style={styles.video}
        onEnd={onEnd}
        resizeMode="cover"
        repeat={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default Intro;
