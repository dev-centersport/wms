import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PaginacaoConsulta({
  paginaAtual,
  totalPaginas,
  setPaginaAtual,
  modalVisivel,
  setModalVisivel,
  inputPagina,
  setInputPagina,
  irParaPagina,
  totalItens,
  itensPorPagina,
}) {
  const [tempInput, setTempInput] = useState('');

  const handleGoToPage = () => {
    const page = parseInt(tempInput);
    if (isNaN(page) || page < 1 || page > totalPaginas) {
      Alert.alert('Página Inválida', `Digite um número entre 1 e ${totalPaginas}`);
      return;
    }
    irParaPagina(tempInput);
    setTempInput('');
    setModalVisivel(false);
  };

  const openModal = () => {
    setTempInput('');
    setModalVisivel(true);
  };

  const closeModal = () => {
    setModalVisivel(false);
    setTempInput('');
  };

  const renderPageNumbers = () => {
    const pages = [];
    
    if (totalPaginas <= 5) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(
          <TouchableOpacity
            key={i}
            style={[
              styles.pageButton,
              paginaAtual === i && styles.activePageButton
            ]}
            onPress={() => setPaginaAtual(i)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pageButtonText,
              paginaAtual === i && styles.activePageButtonText
            ]}>
              {i}
            </Text>
          </TouchableOpacity>
        );
      }
    } else {
      // Sempre mostrar primeira página
      pages.push(
        <TouchableOpacity
          key={1}
          style={[
            styles.pageButton,
            paginaAtual === 1 && styles.activePageButton
          ]}
          onPress={() => setPaginaAtual(1)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.pageButtonText,
            paginaAtual === 1 && styles.activePageButtonText
          ]}>
            1
          </Text>
        </TouchableOpacity>
      );

      // Lógica para páginas do meio
      if (paginaAtual <= 3) {
        // Página atual está no início
        for (let i = 2; i <= 4; i++) {
          pages.push(
            <TouchableOpacity
              key={i}
              style={[
                styles.pageButton,
                paginaAtual === i && styles.activePageButton
              ]}
              onPress={() => setPaginaAtual(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pageButtonText,
                paginaAtual === i && styles.activePageButtonText
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          );
        }
        pages.push(<Text key="ellipsis1" style={styles.ellipsis}>...</Text>);
      } else if (paginaAtual >= totalPaginas - 2) {
        // Página atual está no final
        pages.push(<Text key="ellipsis1" style={styles.ellipsis}>...</Text>);
        for (let i = totalPaginas - 3; i <= totalPaginas - 1; i++) {
          pages.push(
            <TouchableOpacity
              key={i}
              style={[
                styles.pageButton,
                paginaAtual === i && styles.activePageButton
              ]}
              onPress={() => setPaginaAtual(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pageButtonText,
                paginaAtual === i && styles.activePageButtonText
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          );
        }
      } else {
        // Página atual está no meio
        pages.push(<Text key="ellipsis1" style={styles.ellipsis}>...</Text>);
        for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
          pages.push(
            <TouchableOpacity
              key={i}
              style={[
                styles.pageButton,
                paginaAtual === i && styles.activePageButton
              ]}
              onPress={() => setPaginaAtual(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pageButtonText,
                paginaAtual === i && styles.activePageButtonText
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          );
        }
        pages.push(<Text key="ellipsis2" style={styles.ellipsis}>...</Text>);
      }

      // Sempre mostrar última página
      pages.push(
        <TouchableOpacity
          key={totalPaginas}
          style={[
            styles.pageButton,
            paginaAtual === totalPaginas && styles.activePageButton
          ]}
          onPress={() => setPaginaAtual(totalPaginas)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.pageButtonText,
            paginaAtual === totalPaginas && styles.activePageButtonText
          ]}>
            {totalPaginas}
          </Text>
        </TouchableOpacity>
      );
    }

    return pages;
  };

  const getPageInfo = () => {
    const inicio = (paginaAtual - 1) * itensPorPagina + 1;
    const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
    return `${inicio}-${fim} de ${totalItens}`;
  };

  return (
    <>
      <View style={styles.container}>
        {/* Informações da página */}
        <View style={styles.pageInfo}>
          <Text style={styles.pageInfoText}>{getPageInfo()}</Text>
        </View>

        {/* Controles de navegação */}
        <View style={styles.pagination}>
          {/* Botão Anterior */}
          <TouchableOpacity
            style={[
              styles.navButton,
              paginaAtual === 1 && styles.disabledButton
            ]}
            onPress={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
            disabled={paginaAtual === 1}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={paginaAtual === 1 ? "#ccc" : "#28a745"} 
            />
          </TouchableOpacity>

          {/* Números das páginas */}
          <View style={styles.pageNumbers}>
            {renderPageNumbers()}
          </View>

          {/* Botão Próximo */}
          <TouchableOpacity
            style={[
              styles.navButton,
              paginaAtual === totalPaginas && styles.disabledButton
            ]}
            onPress={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
            disabled={paginaAtual === totalPaginas}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={paginaAtual === totalPaginas ? "#ccc" : "#28a745"} 
            />
          </TouchableOpacity>
        </View>

        {/* Botão Ir para página específica - apenas se houver muitas páginas */}
        {totalPaginas > 5 && (
          <TouchableOpacity
            style={styles.goToPageButton}
            onPress={openModal}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#28a745" />
            <Text style={styles.goToPageText}>Ir para página</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para ir para página específica */}
      <Modal 
        visible={modalVisivel} 
        transparent 
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ir para página</Text>
            <Text style={styles.modalSubtitle}>
              Digite um número entre 1 e {totalPaginas}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempInput}
              onChangeText={setTempInput}
              keyboardType="numeric"
              placeholder="Ex: 3"
              placeholderTextColor="#999"
              autoFocus={true}
              onSubmitEditing={handleGoToPage}
              returnKeyType="done"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleGoToPage}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Ir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  pageInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pageInfoText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activePageButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  activePageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ellipsis: {
    fontSize: 14,
    color: '#6c757d',
    marginHorizontal: 4,
  },
  goToPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    gap: 4,
  },
  goToPageText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: width * 0.8,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
