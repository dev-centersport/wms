import React, { useEffect, useState } from 'react';
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
}

const InputLocalizacaoAutocomplete: React.FC<Props> = ({
  label,
  eanDigitado,
  onChangeEAN,
  onSelecionar,
  valorSelecionado
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

  // Handler para quando o usuário pressionar Enter
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscarLocalizacoes(inputValue);
    }
  };

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
