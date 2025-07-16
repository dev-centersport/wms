import { useEffect } from 'react';

interface CarregadorComRetryProps {
  aoCarregar: (dados: any) => void;
  funcaoCarregamento: () => Promise<any>;
  tentativas?: number;
  atrasoMs?: number;
  onErroFinal?: (erro: any) => void;
}

const CarregadorComRetry: React.FC<CarregadorComRetryProps> = ({
  aoCarregar,
  funcaoCarregamento,
  tentativas = 2,
  atrasoMs = 1000,
  onErroFinal,
}) => {
  useEffect(() => {
    const executar = async () => {
      let restantes = tentativas;

      while (restantes > 0) {
        try {
          const dados = await funcaoCarregamento();
          aoCarregar(dados);
          return;
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.message?.includes('404')) {
            console.warn('Erro 404. Tentando novamente...');
            restantes--;
            await new Promise((r) => setTimeout(r, atrasoMs));
          } else {
            console.error('Erro inesperado:', err);
            if (onErroFinal) onErroFinal(err);
            return;
          }
        }
      }

      if (onErroFinal) onErroFinal(new Error('Falha após tentativas'));
    };

    executar();
  }, []);

  return null; // não renderiza nada visível
};

export default CarregadorComRetry;
