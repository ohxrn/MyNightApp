import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Video from "react-native-video";
import UserForm from "./UserForm";

const VideoPlayer = () => {
  const [videoCompleted, setVideoCompleted] = useState(false);

  const handleVideoEnd = () => {
    setVideoCompleted(true);
  };

  if (videoCompleted) {
    return <UserForm />;
  }

  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/mynight intro.mov")}
        style={styles.video}
        resizeMode="cover"
        repeat={false} // Disable repeating the video
        autoplay
        onEnd={handleVideoEnd} // Call this function when the video ends
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
});

export default VideoPlayer;
