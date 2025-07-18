import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function ListaProdutos({ produto, index, onLongPress }) {
  return (
    <TouchableOpacity onLongPress={() => onLongPress(index)} delayLongPress={1100}>
      <View style={styles.itemContainer}>
        <Text style={styles.index}>{index + 1}</Text>
        <Image source={{ uri: produto.url_foto }} style={styles.imagem} />
        <View style={{ flex: 1 }}>
          <Text style={styles.descricao}>{produto.descricao}</Text>
          <Text style={styles.sku}>SKU: {produto.sku}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  index: {
    fontWeight: 'bold',
    width: 24,
    textAlign: 'right',
    marginRight: 8,
  },
  imagem: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  descricao: {
    fontSize: 14,
    fontWeight: '500',
  },
  sku: {
    fontSize: 12,
    color: '#666',
  },
});
