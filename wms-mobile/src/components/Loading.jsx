import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = ({ message = 'Carregando...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#61de27" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default Loading; 