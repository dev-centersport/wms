import { useCallback, useRef, useEffect } from 'react';
import { useState } from 'react';

// Hook para otimizar performance da movimentação
export const useMovimentacaoPerformance = () => {
  const lastBipTime = useRef(0);
  const bipQueue = useRef([]);
  const isProcessing = useRef(false);

  // Throttle para bipagem - máximo 3 bips por segundo
  const throttleBip = useCallback((callback, delay = 300) => {
    const now = Date.now();
    if (now - lastBipTime.current >= delay) {
      lastBipTime.current = now;
      callback();
    } else {
      // Adicionar à fila se estiver muito rápido
      bipQueue.current.push(callback);
    }
  }, []);

  // Processar fila de bips
  const processBipQueue = useCallback(() => {
    if (bipQueue.current.length > 0 && !isProcessing.current) {
      isProcessing.current = true;
      const callback = bipQueue.current.shift();
      if (callback) {
        setTimeout(() => {
          callback();
          isProcessing.current = false;
          processBipQueue();
        }, 100);
      } else {
        isProcessing.current = false;
      }
    }
  }, []);

  // Limpar fila quando componente desmontar
  useEffect(() => {
    return () => {
      bipQueue.current = [];
      isProcessing.current = false;
    };
  }, []);

  // Otimizar scroll com RAF
  const optimizedScrollToEnd = useCallback((flatListRef) => {
    if (flatListRef?.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, []);

  // Debounce otimizado
  const useOptimizedDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Cache simples em memória
  const cache = useRef(new Map());
  
  const getCachedValue = useCallback((key) => {
    return cache.current.get(key);
  }, []);

  const setCachedValue = useCallback((key, value) => {
    cache.current.set(key, value);
    // Limpar cache após 5 minutos
    setTimeout(() => {
      cache.current.delete(key);
    }, 5 * 60 * 1000);
  }, []);

  // Limpar cache
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    throttleBip,
    processBipQueue,
    optimizedScrollToEnd,
    useOptimizedDebounce,
    getCachedValue,
    setCachedValue,
    clearCache,
  };
}; 