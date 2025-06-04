import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function SocialButtons() {
  return (
    <View style={styles.container}>
      <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} />
      <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }} />
      <Image style={styles.icon} source={{ uri: 'https://img.icons8.com/color/48/twitter.png' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginVertical: 10 },
  icon: { width: 40, height: 40, marginHorizontal: 10 },
});
