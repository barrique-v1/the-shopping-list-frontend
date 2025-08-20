import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';

export default function RecipesScreen() {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Rezepte
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Ihre Lieblings-Rezepte werden hier angezeigt
        </Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFBFE',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  title: {
    marginBottom: 8,
    color: '#1C1B1F',
  },
  subtitle: {
    textAlign: 'center',
    color: '#49454F',
  },
});