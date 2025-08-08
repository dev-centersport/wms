import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'left' }]}>SKU</Text>
            <Text style={[styles.tableCell, { flex: 2.5, textAlign: 'left' }]}>EAN</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Localização</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>Qtd</Text>
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
                    <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'left' }]}>{item.sku}</Text>
                    <Text style={[styles.tableCell, { flex: 2.5, textAlign: 'left' }]}>{item.ean}</Text>
                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'left' }]} numberOfLines={1}>
                        {item.localizacao} - {item.armazem}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                        {item.quantidade}
                    </Text>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        fontSize: bold,
    },
    tableCell: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
});
