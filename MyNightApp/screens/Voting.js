import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";

function Voting(props) {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View>
          <Text>Welcome to voting page</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Voting;
