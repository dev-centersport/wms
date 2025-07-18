import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>SKU</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Localização</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Qtd</Text>
        </View>
    );
}

export function TableBody({ data }) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item, index) => `${item.sku}-${index}`}
            renderItem={({ item }) => (
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.sku}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.localizacao}</Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantidade}</Text>
                </View>
            )}
            style={{ flex: 1 }}
        />
    );
}

const styles = StyleSheet.create({
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e9e9e9',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    tableCell: {
        fontSize: 13,
        color: '#333',
    },
});
