import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Removemos a importação de tipos e a definição de 'Props'
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Você pode adicionar sua logo aqui se quiser */}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Movimentacao')}
      >
        <Text style={styles.buttonText}>MOVIMENTAÇÃO</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Ocorrencia')}
      >
        <Text style={styles.buttonText}>OCORRÊNCIA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>CONSULTA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    backgroundColor: '#61DE25',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#61DE25',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
});
