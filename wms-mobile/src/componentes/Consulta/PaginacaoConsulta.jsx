import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Animated, 
  Dimensions,
  Alert
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
  const [scaleValue] = useState(new Animated.Value(1));

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPaginas) {
      animatePress();
      setPaginaAtual(newPage);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPagina);
    if (isNaN(page) || page < 1 || page > totalPaginas) {
      Alert.alert('Página Inválida', `Digite um número entre 1 e ${totalPaginas}`);
      return;
    }
    irParaPagina(inputPagina);
  };

  const openGoToPageModal = () => {
    // Determina se deve mostrar primeira ou última página baseado na posição atual
    const isNearEnd = paginaAtual > totalPaginas / 2;
    const suggestedPage = isNearEnd ? 1 : totalPaginas;
    setInputPagina(suggestedPage.toString());
    setModalVisivel(true);
  };

  const renderPageNumbers = () => {
    const pages = [];
    // Reduzido para 3 páginas visíveis no mobile para economizar espaço
    const maxVisiblePages = 3;
    
    if (totalPaginas <= maxVisiblePages) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPaginas; i++) {
        pages.push(
          <Animated.View key={i} style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                paginaAtual === i && styles.activePageButton
              ]}
              onPress={() => handlePageChange(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pageButtonText,
                paginaAtual === i && styles.activePageButtonText
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }
    } else {
      // Lógica otimizada para mobile - mostrar apenas 3 páginas
      let startPage, endPage;
      
      if (paginaAtual <= 2) {
        // No início: mostrar páginas 1, 2, 3
        startPage = 1;
        endPage = Math.min(3, totalPaginas);
      } else if (paginaAtual >= totalPaginas - 1) {
        // No final: mostrar últimas 3 páginas
        startPage = Math.max(1, totalPaginas - 2);
        endPage = totalPaginas;
      } else {
        // No meio: mostrar página atual e uma de cada lado
        startPage = paginaAtual - 1;
        endPage = paginaAtual + 1;
      }
      
      // Primeira página se não estiver visível
      if (startPage > 1) {
        pages.push(
          <Animated.View key="first" style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => handlePageChange(1)}
              activeOpacity={0.7}
            >
              <Text style={styles.pageButtonText}>1</Text>
            </TouchableOpacity>
          </Animated.View>
        );
        
        if (startPage > 2) {
          pages.push(
            <TouchableOpacity 
              key="dots1" 
              style={styles.dotsContainer}
              onPress={openGoToPageModal}
              activeOpacity={0.7}
            >
              <Text style={styles.dotsText}>•••</Text>
            </TouchableOpacity>
          );
        }
      }
      
      // Páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Animated.View key={i} style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[
                styles.pageButton,
                paginaAtual === i && styles.activePageButton
              ]}
              onPress={() => handlePageChange(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pageButtonText,
                paginaAtual === i && styles.activePageButtonText
              ]}>
                {i}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }
      
      // Última página se não estiver visível
      if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
          pages.push(
            <TouchableOpacity 
              key="dots2" 
              style={styles.dotsContainer}
              onPress={openGoToPageModal}
              activeOpacity={0.7}
            >
              <Text style={styles.dotsText}>•••</Text>
            </TouchableOpacity>
          );
        }
        
        pages.push(
          <Animated.View key="last" style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={styles.pageButton}
              onPress={() => handlePageChange(totalPaginas)}
              activeOpacity={0.7}
            >
              <Text style={styles.pageButtonText}>{totalPaginas}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      }
    }
    
    return pages;
  };

  return (
    <>
      <View style={styles.container}>
        {/* Informações da página */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Página {paginaAtual} de {totalPaginas}
          </Text>
          {totalItens && (
            <Text style={styles.infoSubText}>
              {totalItens} itens no total
            </Text>
          )}
        </View>

        {/* Controles de navegação */}
        <View style={styles.paginationContainer}>
          {/* Botão Anterior */}
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[
                styles.navButton,
                paginaAtual === 1 && styles.disabledButton
              ]}
              onPress={() => handlePageChange(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="chevron-back" 
                size={18} 
                color={paginaAtual === 1 ? "#ccc" : "#4CAF50"} 
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Números das páginas */}
          <View style={styles.pageNumbersContainer}>
            {renderPageNumbers()}
          </View>

          {/* Botão Próximo */}
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              style={[
                styles.navButton,
                paginaAtual === totalPaginas && styles.disabledButton
              ]}
              onPress={() => handlePageChange(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="chevron-forward" 
                size={18} 
                color={paginaAtual === totalPaginas ? "#ccc" : "#4CAF50"} 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Modal para ir para página específica */}
      <Modal 
        visible={modalVisivel} 
        transparent 
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ir para página</Text>
              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Digite o número da página (1 - {totalPaginas}):
            </Text>
            
            <TextInput
              keyboardType="numeric"
              value={inputPagina}
              onChangeText={setInputPagina}
              placeholder={`Ex: ${Math.min(3, totalPaginas)}`}
              style={styles.modalInput}
              autoFocus
              onSubmitEditing={handleGoToPage}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleGoToPage}
              >
                <Text style={styles.modalButtonPrimaryText}>Ir</Text>
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
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoSubText: {
    fontSize: 11,
    color: '#adb5bd',
    fontWeight: '400',
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    shadowOpacity: 0,
    elevation: 0,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activePageButton: {
    backgroundColor: '#4CAF50',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#495057',
  },
  activePageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  dotsContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dotsText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
