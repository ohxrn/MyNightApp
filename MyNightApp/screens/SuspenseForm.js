import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

function SuspenseForm(props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        hidesWhenStopped={true}
        size={"large"}
        color={"pink"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
});

export default SuspenseForm;
