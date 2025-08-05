import React, { memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ListaProdutos = memo(({ produto, index, onLongPress }) => {
  const handleLongPress = () => {
    onLongPress(index);
  };

  return (
    <TouchableOpacity 
      onLongPress={handleLongPress} 
      delayLongPress={1000}
      activeOpacity={0.7}
      style={styles.touchableContainer}
    >
      <View style={styles.itemContainer}>
        <Text style={styles.index}>{index + 1}</Text>
        <Image 
          source={{ uri: produto.url_foto }} 
          style={styles.imagem}
          defaultSource={require('../../../assets/images/no-image.png')}
          resizeMode="cover"
          fadeDuration={0}
        />
        <View style={styles.contentContainer}>
          <Text style={styles.descricao} numberOfLines={2} ellipsizeMode="tail">
            {produto.descricao}
          </Text>
          <Text style={styles.sku}>SKU: {produto.sku}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

ListaProdutos.displayName = 'ListaProdutos';

const styles = StyleSheet.create({
  touchableContainer: {
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  index: {
    fontWeight: 'bold',
    width: 28,
    textAlign: 'center',
    marginRight: 8,
    fontSize: 14,
    color: '#666',
  },
  imagem: {
    width: 44,
    height: 44,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  descricao: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    color: '#333',
    lineHeight: 16,
  },
  sku: {
    fontSize: 11,
    color: '#888',
    fontWeight: '400',
  },
});

export default ListaProdutos;
