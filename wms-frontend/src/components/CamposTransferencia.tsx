import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import InputLocalizacaoAutocomplete from '../components/InputLocalizacaoAutoComplete';

interface LocalizacaoOption {
  id: number;
  nome: string;
  ean?: string;
}

interface Props {
  tipo: 'entrada' | 'saida' | 'transferencia';
  origem: LocalizacaoOption | null;
  destino: LocalizacaoOption | null;
  setOrigem: (loc: LocalizacaoOption | null) => void;
  setDestino: (loc: LocalizacaoOption | null) => void;
  onLocalizacaoAberta?: (ean: string) => void;
}

const CamposTransferencia: React.FC<Props> = ({ tipo, origem, destino, setOrigem, setDestino, onLocalizacaoAberta }) => {
  const [eanOrigem, setEanOrigem] = useState('');
  const [eanDestino, setEanDestino] = useState('');

  useEffect(() => {
    setEanOrigem('');
    setEanDestino('');
  }, [tipo]);

  if (tipo !== 'transferencia') return null;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <InputLocalizacaoAutocomplete
        label="Localização Origem"
        eanDigitado={eanOrigem}
        onChangeEAN={setEanOrigem}
        onSelecionar={setOrigem}
        valorSelecionado={origem}
        onLocalizacaoAberta={onLocalizacaoAberta}
      />

      <InputLocalizacaoAutocomplete
        label="Localização Destino"
        eanDigitado={eanDestino}
        onChangeEAN={setEanDestino}
        onSelecionar={setDestino}
        valorSelecionado={destino}
        onLocalizacaoAberta={onLocalizacaoAberta}
      />
    </Box>
  );
};

export default CamposTransferencia;
