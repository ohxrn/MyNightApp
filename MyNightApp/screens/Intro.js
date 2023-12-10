import React, { useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native";

const Intro = () => {
  const navigation = useNavigation();
  const videoRef = useRef(null);

  const onEnd = () => {
    // Video playback has ended, navigate to the desired screen
    navigation.navigate("HomeScreen");
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: "../assets/mm.mp4" }}
        style={styles.video}
        onEnd={onEnd}
        resizeMode="cover"
        repeat={false}
      />
      <TouchableOpacity onPress={() => onEnd()}>
        <Text>Skip Video</Text>
      </TouchableOpacity>
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
