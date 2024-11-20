import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProfileHeader = () => {
  return (
    <View style={styles.header}>
      <View style={styles.profile}>
        <View style={styles.avatar} />
        <Text style={styles.name}>Jillian Hanson</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
});