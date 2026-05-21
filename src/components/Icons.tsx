import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export const ChatbotIcon = () => (
  <View style={styles.chatbotIconContainer}>
    {/* Robot Outer Body */}
    <View style={styles.robotHead}>
      {/* Eyes Row */}
      <View style={styles.robotEyesRow}>
        <View style={styles.robotEye} />
        <View style={styles.robotEye} />
      </View>
      {/* Smiling Mouth */}
      <View style={styles.robotMouth} />
    </View>
    {/* Antennas */}
    <View style={styles.robotAntennaPole} />
    <View style={styles.robotAntennaTip} />
  </View>
);

export const SearchIcon = () => (
  <View style={styles.searchIconContainer}>
    <View style={styles.searchGlassCircle} />
    <View style={styles.searchGlassHandle} />
  </View>
);

export const BackIcon = () => (
  <View style={styles.backIconContainer}>
    <View style={styles.backArrowLeft} />
  </View>
);

interface CheckmarksProps {
  status?: 'sent' | 'delivered' | 'read';
}

export const Checkmarks = ({ status }: CheckmarksProps) => {
  const isRead = status === 'read';
  const color = isRead ? '#38BDF8' : '#94A3B8';
  return (
    <View style={styles.checkmarksRow}>
      <Text style={[styles.checkmarkText, { color }]}>✓</Text>
      <Text style={[styles.checkmarkText, styles.checkmarkOffset, { color }]}>✓</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chatbotIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  robotHead: {
    width: 22,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  robotEyesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  robotEye: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981', // Neon Glowing eye
  },
  robotMouth: {
    width: 10,
    height: 1.5,
    backgroundColor: '#4F46E5',
    alignSelf: 'center',
    borderRadius: 1,
  },
  robotAntennaPole: {
    width: 1.5,
    height: 4,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 5,
  },
  robotAntennaTip: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#10B981',
    position: 'absolute',
    top: 2,
  },
  searchIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchGlassCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
  },
  searchGlassHandle: {
    width: 2,
    height: 5,
    backgroundColor: '#64748B',
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  backIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowLeft: {
    width: 10,
    height: 10,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#F8FAFC',
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  checkmarksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkmarkOffset: {
    marginLeft: -3,
  },
});
