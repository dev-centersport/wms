import React, { useEffect, useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
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

  useEffect(() => {
    const fetchLocalizacoes = async () => {
      if (!eanDigitado || eanDigitado.trim().length === 0) {
        setOptions([]); // Limpa opções se o campo estiver vazio
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
        }
      } catch (err) {
        console.error('Erro ao buscar localizações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalizacoes();
  }, [eanDigitado]);


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
          sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
          InputProps={{
            ...params.InputProps,
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
