import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function ModalCancelar({ visible, onClose, onConfirmar }) {
  if (!visible) return null;
  return (
    <View style={{
      position: 'absolute', top: 100, left: 30, right: 30,
      backgroundColor: '#fff', borderRadius: 10, padding: 30, elevation: 10, zIndex: 1000
    }}>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>Deseja realmente cancelar?</Text>
      <TouchableOpacity onPress={onConfirmar} style={{ backgroundColor: 'green', padding: 10, borderRadius: 6 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Sim, Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
        <Text style={{ color: '#333', textAlign: 'center' }}>Fechar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', width: '80%', borderRadius: 8, overflow: 'hidden', borderColor: '#4CAF50', borderWidth: 1 },
  modalHeader: { backgroundColor: '#4CAF50', padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  modalTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  modalClose: { color: '#fff', fontSize: 18 },
  modalContent: { alignItems: 'center', padding: 20 },
  alertIcon: { fontSize: 40, marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  btnConfirmar: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  confirmarText: { color: '#fff', fontSize: 16 },
});