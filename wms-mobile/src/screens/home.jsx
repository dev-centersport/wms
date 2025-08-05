import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* Barra superior com a logo do WMS */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/wms.png')}
          style={styles.logo}
        />
      </View>

      {/* Botões principais */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 180 }]} // margem de 30 pixels no topo
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Consulta')}
      >
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
    paddingTop: 0,
  },
  header: {
    backgroundColor: '#61DE25',
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
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
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
});
