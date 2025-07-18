// componentes/Movimentacao/ListaProdutos.jsx
// ListaProdutos.jsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function ListaProdutos({ produto, index }) {
    if (!produto) return null;

    return (
        <View style={styles.produtoItem}>
            <Text style={styles.contador}>{index + 1}</Text>
            {produto.url_foto && (
                <Image
                    source={{ uri: produto.url_foto }}
                    style={styles.foto}
                    resizeMode="cover"
                />
            )}
            <View style={{ flex: 1 }}>
                <Text style={styles.produtoNome}>{produto.descricao}</Text>
                <Text style={styles.produtoSKU}>SKU: {produto.sku}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    produtoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    contador: {
        fontWeight: 'bold',
        width: 20,
        marginRight: 6,
        textAlign: 'center',
    },
    foto: {
        width: 40,
        height: 40,
        marginRight: 10,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
    },
    produtoNome: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    produtoSKU: {
        fontSize: 12,
        color: '#888',
    },
});
