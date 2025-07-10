import { useEffect } from 'react';
import { logUserAction } from '../services/LoginServices';

export const usePageLogger = (pageName: string, extraData: any = {}) => {
  useEffect(() => {
    logUserAction('ACESSO_PAGINA', { pagina: pageName, ...extraData });
  }, []);
};

