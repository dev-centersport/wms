import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function ModalCancelar({ visible, onClose, onCancelar, tipo }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancelar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente cancelar {tipo ? `a ${tipo}` : 'essa ação'}?
            </Text>
            <TouchableOpacity
              style={styles.btnConfirmar}
              onPress={() => {
                onCancelar();
                onClose();
              }}
            >
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
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#4CAF50',
    borderWidth: 1,
    elevation: 12,
  },
  modalHeader: {
    backgroundColor: '#4CAF50',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalClose: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  modalContent: { alignItems: 'center', padding: 22 },
  alertIcon: { fontSize: 40, marginBottom: 12 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#222' },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  confirmarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
