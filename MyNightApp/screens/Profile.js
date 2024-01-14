import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, storage } from "../Components/Config";
import { getDownloadURL, ref, listAll } from "firebase/storage";
import { TextInput } from "react-native-paper";

export default function Profile() {
  const [imageLinks, setImageLinks] = useState();
  //
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [username, setUsername] = useState();
  const [age, setAge] = useState();
  const [bio, setBio] = useState();
  //
  useEffect(() => {
    const userFolderRef = ref(storage, "PhotoBase/" + auth?.currentUser.uid);

    listAll(userFolderRef)
      .then((result) => {
        // result.items is an array of references to each photo
        const downloadPromises = result.items.map((itemRef) => {
          return getDownloadURL(itemRef);
        });

        // Promise.all resolves when all downloadURL promises are resolved
        return Promise.all(downloadPromises);
      })
      .then((downloadURLs) => {
        // downloadURLs is an array of URLs for each photo
        // You can handle these URLs as needed, for example, displaying them in your UI
        console.log(downloadURLs);
        setImageLinks(downloadURLs);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
      });
  }, []);
  return (
    <View>
      <View>
        <Text>Customize your profile</Text>
      </View>
      <View style={{ display: "flex" }}>
        {imageLinks?.map((url, index) => (
          <Image
            key={index}
            style={{
              width: 150,
              height: 150,
              margin: 5,
              borderRadius: 49,
            }}
            source={{ uri: url }}
          />
        ))}
      </View>

      <View>
        <Text>{auth.currentUser?.email}</Text>
      </View>
      <View>
        <Text>{auth.currentUser?.displayName}</Text>
      </View>
      <View>
        <TextInput
          placeholder="your first name"
          value={fName}
          onChangeText={(data) => {
            setFName(fName);
          }}
        ></TextInput>
      </View>
      <View>
        <TextInput
          placeholder="your last name"
          value={lName}
          onChangeText={(data) => {
            setLName(lName);
          }}
        ></TextInput>
      </View>
      <View>
        <TextInput
          placeholder="username"
          value={username}
          onChangeText={(data) => {
            setUsername(username);
          }}
        ></TextInput>
      </View>
      <View>
        <TextInput
          placeholder="age"
          value={age}
          onChangeText={(data) => {
            setAge(age);
          }}
        ></TextInput>
      </View>
      <View>
        <TextInput
          placeholder="bio"
          value={bio}
          onChangeText={(data) => {
            setBio(bio);
          }}
        ></TextInput>
      </View>
    </View>
  );
}
