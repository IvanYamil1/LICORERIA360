import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function GoldHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  line: {
    height: 1.5,
    backgroundColor: colors.gold,
    marginTop: 10,
    opacity: 0.4,
    borderRadius: 1,
  },
});
