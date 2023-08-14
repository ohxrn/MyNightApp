// import React, { useState } from "react";
// import { View, StyleSheet, TextInput, Button, Text } from "react-native";

// import {
//   Database,
//   firebase,
//   getDatabase,
//   ref,
//   set,
//   push,
//   child,
// } from "firebase/database";
// import { db } from "./Config";

// function UserForm(props) {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");

//   const create = () => {
//     const newKey = push(child(ref(db), "users")).key;
//     set(ref(db, "users/" + newKey), {
//       firstName: firstName,
//       lastName: lastName,
//       email: email,
//     })
//       .then(() => {
//         alert("data updated");
//       })
//       .catch((error) => {
//         alert(error);
//       });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.gradientBackground}>
//         <TextInput
//           placeholder="insert first name"
//           value={firstName}
//           onChangeText={(text) => {
//             setFirstName(text);
//           }}
//         ></TextInput>
//         <TextInput
//           placeholder="insert last name"
//           value={lastName}
//           onChangeText={(text) => {
//             setLastName(text);
//           }}
//         ></TextInput>
//         <TextInput
//           placeholder="insert email"
//           value={email}
//           onChangeText={(text) => {
//             setEmail(text);
//           }}
//         ></TextInput>
//         <Button title="submit data" onPress={create} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "orange",
//   },
//   gradientBackground: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     background: "linear-gradient(135deg, #FF6B8B, #3B83FF)", // Use linear-gradient CSS syntax
//   },
//   text: {
//     color: "white",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
// });
// export default UserForm;
