import React, { useState, useEffect } from "react";
import { Button, Image, View, Platform, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
//
import UploadProgressBar from "./UploadProgressBar";
import UploadLast from "./UploadLast";
import { Ionicons } from "@expo/vector-icons";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { auth, storage } from "../Components/Config";
import Video from "react-native-video";

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const [progress, setProgress] = useState(0);
  //

  //
  if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
    return (
      <View>
        <SafeAreaView>
          <Text>Camera permissions not granted-</Text>
          <Button
            title="request permissios"
            onPress={requestPermission}
          ></Button>
        </SafeAreaView>
      </View>
    );
  }

  const takePhoto = async () => {
    const camerResp = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
  };

  const imageUpload = async (uri, fileType) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(
      storage,
      `PhotoBase/${auth.currentUser.uid}/${new Date().getTime()}`
    );
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Here is the progress", progress);
        setProgress(progress.toFixed());
      },
      (error) => {
        console.log(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("file available at", downloadURL);
          setImage(downloadURL);
          // Any other logic you want to execute after successful upload
        } catch (error) {
          console.error("Error getting download URL:", error);
        }
      }
    );
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await imageUpload(result.assets[0].uri, "image");
    }
  };
  const pickVideo = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
      await imageUpload(result.assets[0].uri, "video");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {image && <UploadLast image={image} video={video} progress={progress} />}

      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      <Button title="Pick a video from camera roll" onPress={pickVideo} />
      {image && (
        <Video source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}
      <Button title="Take photo" onPress={takePhoto} />
    </View>
  );
}
