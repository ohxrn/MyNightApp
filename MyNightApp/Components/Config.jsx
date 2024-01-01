import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQKqs2S6JRAjiPGb-9CDH1lapU-eIMmTM",
  authDomain: "mynightapp-c9c7c.firebaseapp.com",
  databaseURL: "https://mynightapp-c9c7c-default-rtdb.firebaseio.com",
  projectId: "mynightapp-c9c7c",
  storageBucket: "mynightapp-c9c7c.appspot.com",
  messagingSenderId: "1025308955866",
  appId: "1:1025308955866:web:5338e130fab28f6456c1e3",
  measurementId: "G-GH3PSMEY8X",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getDatabase(app);

//
// const uploadToFirebase = async (uri, name) => {
//   const fetchResponse = await fetch(uri);
//   const theBlob = await Response.blob();
//   const storage = getStorage();
//   const storageRef = ref(storage, "images/rivers.jpg");

//   const uploadTask = uploadBytesResumable(storageRef, file);

//   // Register three observers:
//   // 1. 'state_changed' observer, called any time the state changes
//   // 2. Error observer, called on failure
//   // 3. Completion observer, called on successful completion
//   uploadTask.on(
//     "state_changed",
//     (snapshot) => {
//       // Observe state change events such as progress, pause, and resume
//       // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//       const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//       console.log("Upload is " + progress + "% done");
//       switch (snapshot.state) {
//         case "paused":
//           console.log("Upload is paused");
//           break;
//         case "running":
//           console.log("Upload is running");
//           break;
//       }
//     },
//     (error) => {
//       // Handle unsuccessful uploads
//     },
//     () => {
//       // Handle successful uploads on complete
//       // For instance, get the download URL: https://firebasestorage.googleapis.com/...
//       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//         console.log("File available at", downloadURL);
//       });
// }
// );
// };

export { auth, db };
