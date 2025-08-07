import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaginacaoConsulta({
  paginaAtual,
  totalPaginas,
  setPaginaAtual,
  modalVisivel,
  setModalVisivel,
  inputPagina,
  setInputPagina,
  irParaPagina,
  proximaPagina,
  paginaAnterior,
  totalRegistros,
  carregando,
}) {
  return (
    <>
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, carregando && styles.disabledBtn]}
          onPress={paginaAnterior}
          disabled={carregando || paginaAtual <= 1}>
          <Text style={[styles.pageText, carregando && styles.disabledText]}>◀</Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            Página {paginaAtual} de {totalPaginas}
          </Text>
          <Text style={styles.totalText}>
            Total: {totalRegistros} registros
          </Text>
        </View>

        {paginaAtual < totalPaginas - 2 && (
          <>
            <Text style={styles.pageText}>...</Text>
            <Text style={styles.pageText}>{totalPaginas}</Text>
            <TouchableOpacity onPress={() => setModalVisivel(true)} disabled={carregando}>
              <Ionicons 
                name="ellipsis-horizontal" 
                size={20} 
                color={carregando ? "#ccc" : "green"} 
                style={{ marginLeft: 5 }} 
              />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.pageBtn, carregando && styles.disabledBtn]}
          onPress={proximaPagina}
          disabled={carregando || paginaAtual >= totalPaginas}>
          <Text style={[styles.pageText, carregando && styles.disabledText]}>▶</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10 }}>Digite o número da página:</Text>
            <TextInput
              keyboardType="numeric"
              value={inputPagina}
              onChangeText={setInputPagina}
              placeholder="Ex: 3"
              style={styles.modalInput}
            />
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => irParaPagina(inputPagina)}
              disabled={carregando}
            >
              <Text style={styles.modalButtonText}>
                {carregando ? "Carregando..." : "Ir"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  pageBtn: {
    paddingHorizontal: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pageInfo: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageText: {
    fontSize: 14,
    marginHorizontal: 4,
    color: '#333',
  },
  disabledText: {
    color: '#ccc',
  },
  totalText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 16,
    width: 240,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 14,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
