import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import Video from "react-native-video";

const VideoIntro = ({ navigation }) => {
  const videoRef = useRef(null);

  const onEnd = () => {
    // Video playback has ended, navigate to the next screen
    navigation.navigate("Next");
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: "your_video_url.mp4" }}
        style={styles.video}
        onEnd={onEnd}
        resizeMode="cover"
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

export default VideoIntro;
