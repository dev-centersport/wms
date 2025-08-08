import React, { useEffect, useState, useCallback } from 'react';
import { Autocomplete, CircularProgress, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../services/API';

interface LocalizacaoOption {
  id: number;
  nome: string;
  ean?: string;
  armazem?: {
    nome: string;
  };
}

interface Props {
  label: string;
  eanDigitado: string;
  onChangeEAN: (value: string) => void;
  onSelecionar: (loc: LocalizacaoOption | null) => void;
  valorSelecionado: LocalizacaoOption | null;
  onLocalizacaoAberta?: (ean: string) => void;
}

const InputLocalizacaoAutocomplete: React.FC<Props> = ({
  label,
  eanDigitado,
  onChangeEAN,
  onSelecionar,
  valorSelecionado,
  onLocalizacaoAberta
}) => {
  const [options, setOptions] = useState<LocalizacaoOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Função para buscar localizações quando o usuário pressionar Enter
  const buscarLocalizacoes = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/localizacao?search=${encodeURIComponent(searchTerm.trim())}`);
      const todas = Array.isArray(response.data.results) ? response.data.results : [];

      const formatadas = todas.map((l: any) => ({
        id: l.localizacao_id,
        nome: l.nome,
        ean: l.ean,
        armazem: l.armazem,
      }));

      setOptions(formatadas);

      // Se encontrou exatamente uma localização com o EAN digitado, seleciona automaticamente
      const encontrada = formatadas.find((l: LocalizacaoOption) => l.ean === searchTerm.trim());
      if (encontrada) {
        onSelecionar(encontrada);
      }
    } catch (err) {
      console.error('Erro ao buscar localizações:', err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar todas as localizações quando o EAN é digitado
  const fetchLocalizacoes = async () => {
    if (!eanDigitado || eanDigitado.trim().length === 0) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/localizacao?limit=3000');
      const todas = Array.isArray(response.data.results) ? response.data.results : [];

      const formatadas = todas.map((l: any) => ({
        id: l.localizacao_id,
        nome: l.nome,
        ean: l.ean,
        armazem: l.armazem,
      }));

      setOptions(formatadas);

      const encontrada = formatadas.find((l: LocalizacaoOption) => l.ean === eanDigitado.trim());
      if (encontrada) {
        onSelecionar(encontrada);
        
        // Tenta abrir a localização se a função estiver disponível
        if (onLocalizacaoAberta && encontrada.ean) {
          try {
            await api.get(`/movimentacao/abrir-localizacao/${encontrada.ean}`);
            onLocalizacaoAberta(encontrada.ean);
          } catch (erro: any) {
            console.warn('Erro ao abrir localização:', erro);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar localizações:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com tecla pressionada
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscarLocalizacoes(inputValue);
    }
  };

  // Effect para buscar localizações quando o EAN é digitado
  useEffect(() => {
    fetchLocalizacoes();
  }, [eanDigitado, onSelecionar, onLocalizacaoAberta]);

  return (
    <Autocomplete
      fullWidth
      size="small"
      options={options}
      getOptionLabel={(opt) => `${opt.nome} - ${opt.armazem?.nome || ''}`}
      value={valorSelecionado}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
        onChangeEAN(newInputValue);
      }}
      onChange={(_, val) => onSelecionar(val)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          onKeyDown={handleKeyDown}
          sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default InputLocalizacaoAutocomplete;
