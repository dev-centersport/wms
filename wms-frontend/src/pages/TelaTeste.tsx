import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  criarLocalizacao,
  buscarArmazem,
  buscarTiposDeLocalizacao,
} from '../services/API';

const TelaTeste: React.FC = () => {
  // estados dos inputs
  const [nome, setLocalizacao] = useState('');
  const [tipo, setTipo] = useState('');
  const [armazem, setArmazem] = useState('');
  const [altura, setAltura] = useState('');
  const [largura, setLargura] = useState('');
  const [comprimento, setComprimento] = useState('');

  // listas para os selects
  const [listaArmazens, setListaArmazens] = useState<
    { armazem_id: number; nome: string }[]
  >([]);
  const [listaTipos, setListaTipos] = useState<
    { tipo_localizacao_id: number; tipo: string }[]
  >([]);

  // carrega armazéns e tipos ao montar
  useEffect(() => {
    const carregar = async () => {
      try {
        const armazens = await buscarArmazem();
        const tipos = await buscarTiposDeLocalizacao();
        setListaArmazens(armazens);
        setListaTipos(tipos);
      } catch (err) {
        console.error('Erro ao carregar armazéns ou tipos:', err);
        alert('Falha ao carregar dados para o formulário.');
      }
    };
    carregar();
  }, []);

  // envio do formulário
  const handleEnviar = async () => {
    if (
      !nome ||
      !tipo ||
      !armazem ||
      !altura ||
      !largura ||
      !comprimento
    ) {
      alert(
        'Preencha todos os campos obrigatórios: localização, tipo, armazém, altura, largura e comprimento.'
      );
      return;
    }

    try {
      await criarLocalizacao({
        nome,
        status: 'fechada',
        tipo,
        altura,
        largura,
        comprimento,
      });

      alert('Localização criada com sucesso!');

      // limpa campos
      setLocalizacao('');
      setTipo('');
      setArmazem('');
      setAltura('');
      setLargura('');
      setComprimento('');
    } catch (error: any) {
      alert('Erro ao criar localização: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Teste de Criação de Localização (POST)
        </Typography>

        <TextField
          fullWidth
          label="Nome da Localização"
          value={nome}
          onChange={(e) => setLocalizacao(e.target.value)}
          margin="normal"
        />

        {/* Select de Tipo de Localização */}
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel id="tipo-label">Tipo de Localização</InputLabel>
          <Select
            labelId="tipo-label"
            value={tipo}
            label="Tipo de Localização"
            onChange={(e) => setTipo(e.target.value as string)}
          >
            {listaTipos.map((t) => (
              <MenuItem key={t.tipo_localizacao_id} value={t.tipo}>
                {t.tipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Select de Armazém */}
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel id="armazem-label">Armazém</InputLabel>
          <Select
            labelId="armazem-label"
            value={armazem}
            label="Armazém"
            onChange={(e) => setArmazem(e.target.value as string)}
          >
            {listaArmazens.map((a) => (
              <MenuItem key={a.armazem_id} value={a.nome}>
                {a.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Altura (cm)"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Largura (cm)"
          value={largura}
          onChange={(e) => setLargura(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Comprimento (cm)"
          value={comprimento}
          onChange={(e) => setComprimento(e.target.value)}
          margin="normal"
        />

        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleEnviar}>
            Enviar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TelaTeste;
