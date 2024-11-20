import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Plus, BookOpen, User } from 'lucide-react-native';

export const BottomNavigation = () => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton}>
        <Home size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButtonMain}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <BookOpen size={24} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <User size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    padding: 8,
  },
  navButtonMain: {
    backgroundColor: '#1a73e8',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
});