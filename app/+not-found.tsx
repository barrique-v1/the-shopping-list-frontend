import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function NotFoundScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Seite nicht gefunden
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Diese Seite existiert nicht.
      </Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Listen' as never)}
        style={styles.button}
      >
        Zur�ck zu Listen
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFBFE',
  },
  title: {
    marginBottom: 16,
    color: '#1C1B1F',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#49454F',
  },
  button: {
    marginTop: 16,
  },
});