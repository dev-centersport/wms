import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserInfoBar({ usuario }) {
  // Garante que sempre temos dados válidos
  const dadosUsuario = {
    responsavel: usuario?.usuario || "Usuário",
    perfil: usuario?.perfil || "Sem perfil",
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle" size={24} color="#4CAF50" />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={styles.labelText}>Usuário</Text>
            <Text style={styles.responsavelText}>{dadosUsuario.responsavel}</Text>
          </View>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.perfilSection}>
         
          <View style={[styles.perfilTextContainer, {alignItems: 'center'}]}>
            <Text style={styles.labelText}>Perfil</Text>
            <Text style={styles.perfilText}>{dadosUsuario.perfil}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  perfilSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userTextContainer: {
    flex: 1,
  },
  perfilTextContainer: {
    flex: 1,
  },
  labelText: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  responsavelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    lineHeight: 18,
  },
  perfilText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    lineHeight: 17,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#dee2e6',
    marginHorizontal: 20,
  },
}); 