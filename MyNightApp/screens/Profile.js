import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, storage } from "../Components/Config";
import { getDownloadURL, listAll } from "firebase/storage";
import { Button, TextInput } from "react-native-paper";
import { db } from "../Components/Config";

import { getDatabase, set, ref, get } from "firebase/database";

export default function Profile() {
  const [imageLinks, setImageLinks] = useState();
  //
  const database = getDatabase();
  //
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [username, setUsername] = useState();
  const [age, setAge] = useState();
  const [bio, setBio] = useState();

  const submitTheData = () => {
    const db = getDatabase();
    const uid = auth.currentUser?.uid;
    set(ref(db, "User Data/" + uid), {
      first_name: fName,
      last_name: lName,
      username: username,
      age: age,
      bio: bio,
    });
    const userData = {
      first_name: fName,
      last_name: lName,
      username: username,
      age: age,
      bio: bio,
    };
    console.log("here is the data", userData);
  };

  //
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const userRef = ref(database, `User Data/${uid}`);

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log("User data: ", userData);

          // Set your state values based on the retrieved data
          setFName(userData.first_name);
          setLName(userData.last_name);
          setUsername(userData.username);
          setAge(userData.age);
          setBio(userData.bio);
        } else {
          console.log("User data not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);
  //

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     // Your function to be executed after the timer
  //     runAlg();
  //   }, 3000); //
  // }, []);

  // const runAlg = () => {
  //   const userFolderRef = ref(storage, "PhotoBase/" + auth?.currentUser.uid);

  //   listAll(userFolderRef)
  //     .then((result) => {
  //       // result.items is an array of references to each photo
  //       const downloadPromises = result.items.map((itemRef) => {
  //         return getDownloadURL(itemRef);
  //       });

  //       // Promise.all resolves when all downloadURL promises are resolved
  //       return Promise.all(downloadPromises);
  //     })
  //     .then((downloadURLs) => {
  //       // downloadURLs is an array of URLs for each photo
  //       // You can handle these URLs as needed, for example, displaying them in your UI
  //       console.log(downloadURLs);
  //       setImageLinks(downloadURLs);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching photos:", error);
  //     });
  // };
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
            setFName(data);
          }}
        />
      </View>
      <View>
        <TextInput
          placeholder="your last name"
          value={lName}
          onChangeText={(data) => {
            setLName(data);
          }}
        />
      </View>
      <View>
        <TextInput
          placeholder="username"
          value={username}
          onChangeText={(data) => {
            setUsername(data);
          }}
        />
      </View>
      <View>
        <TextInput
          placeholder="age"
          value={age}
          onChangeText={(data) => {
            setAge(data);
          }}
        />
      </View>
      <View>
        <TextInput
          placeholder="bio"
          value={bio}
          onChangeText={(data) => {
            setBio(data);
          }}
        />
      </View>
      <TouchableOpacity onPress={submitTheData}>
        <Text>Submit data</Text>
      </TouchableOpacity>
    </View>
  );
}
