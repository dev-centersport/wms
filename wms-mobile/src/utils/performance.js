// Utilitários de performance para otimizar o mobile

// Debounce para evitar múltiplas chamadas
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle para limitar frequência de execução
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoização simples para evitar recálculos
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Otimização de scroll para FlatList
export const getFlatListOptimizations = () => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  windowSize: 10,
  initialNumToRender: 10,
  updateCellsBatchingPeriod: 50,
  disableVirtualization: false,
});

// Otimização de imagem
export const getImageOptimizations = () => ({
  resizeMode: 'cover',
  fadeDuration: 0,
  progressiveRenderingEnabled: false,
});

// Configurações de performance para diferentes dispositivos
export const getPerformanceConfig = () => {
  const isLowEndDevice = false; // Pode ser detectado baseado em specs do dispositivo
  
  return {
    debounceDelay: isLowEndDevice ? 500 : 300,
    throttleDelay: isLowEndDevice ? 200 : 100,
    maxBatchSize: isLowEndDevice ? 5 : 10,
    windowSize: isLowEndDevice ? 5 : 10,
  };
}; 