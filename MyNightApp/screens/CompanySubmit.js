import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";

function CompanySubmit(props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>
        Thank you for signing your company up. Our team will be reaching out
        shortly. ~MyNightLLC
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    margin: 55,
  },
});

export default CompanySubmit;
