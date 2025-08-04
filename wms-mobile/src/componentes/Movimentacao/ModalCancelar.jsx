// componentes/ModalCancelar.jsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModalCancelar({ visible, onClose, onCancelar, tipo }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: '#fff' }]}>Cancelar</Text>
          <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente cancelar a {tipo}?
            </Text>
            <TouchableOpacity style={styles.btnConfirmar} onPress={() => {
              onCancelar();
              onClose();
            }}>
              <Text style={styles.confirmarText}>Sim, Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  modalHeader: {
    backgroundColor: '#4CAF50',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  modalClose: { color: '#fff', fontSize: 18 },
  modalContent: { alignItems: 'center', padding: 20 },
  alertIcon: { fontSize: 40, marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  confirmarText: { color: '#fff', fontSize: 16 },
});
