import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";

function Voting(props) {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={{ marginBottom: 50 }}>
          <Text>My Friends</Text>
        </View>
        <View>
          <Text>Add Friends</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default Voting;
