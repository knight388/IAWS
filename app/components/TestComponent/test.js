import React from 'react';
import {AppRegistry, StyleSheet, Text, View } from 'react-native';

export default class Test extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>LOsL</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 30
  },
});


AppRegistry.registerComponent("Test", () => Test);
