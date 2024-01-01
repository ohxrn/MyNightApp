import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Button,
  TouchableOpacity,
} from "react-native";
//
import { BlurView, VibrancyView } from "@react-native-community/blur";
import UploadProgressBar from "./UploadProgressBar";
import { Video } from "expo-av";
import { ProgressBar } from "react-native-paper";

function UploadLast({ image, video, progress }) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        },
      ]}
    >
      <VibrancyView
        blurType="ultraThinMaterialDark"
        style={StyleSheet.absoluteFill}
      ></VibrancyView>
      <BlurView
        style={{
          width: "70%",

          alignItems: "center",
          paddingVertical: 16,
          rowGap: 12,
          borderRadius: 13,
        }}
        blurType="light"
      >
        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: 100,
              height: 100,
              resizeMode: "contain",
              borderRadius: 6,
            }}
          />
        )}
        {video && (
          <Video
            source={{ uri: video }}
            videoStyle={{}}
            rate={1}
            volume={1}
            isMuted={false}
            resizeMode="contain"
            style={{
              width: 200,
              height: 200,
            }}
          />
        )}
        <Text style={{ fontSize: 20 }}>Uploading...</Text>
        <UploadProgressBar progress={progress} />
        <View
          style={{
            height: 1,
            borderWidth: StyleSheet.hairlineWidth,
            width: "100%",
            borderColor: "grey",
          }}
        ></View>
        <TouchableOpacity>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default UploadLast;
