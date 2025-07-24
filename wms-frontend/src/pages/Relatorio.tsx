// src/pages/Relatorio.tsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Layout from '../components/Layout';

export default function Relatorio() {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleAbrirInventario = () => {
    setMostrarFiltros((prev) => !prev);
  };

  const handleAuditoria = () => {
    // Navegar para página de auditoria
  };

  const handleReposicao = () => {
    // Navegar para página de reposição
  };

  return (
    <Layout>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Relatórios
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Relatório de Inventário */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderLeft: '6px solid #61de27',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={handleAbrirInventario}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Gerar Inventário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download do inventário de estoque
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        {/* Relatório de Auditoria */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderLeft: '6px solid #61de27',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={handleAuditoria}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Relatório de Auditoria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Produtos em auditoria
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        {/* Relatório de Reposição */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderLeft: '6px solid #61de27',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { boxShadow: 4 }
          }}
          onClick={handleReposicao}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Relatório de Reposição
            </Typography>
            <Typography variant="body2" sx={{ color: 'red' }}>
              Ex: Produtos que tem em outros armazéns mas não tem na dib jorge
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Filtros de Inventário visíveis somente após clique */}
      <Collapse in={mostrarFiltros} timeout="auto" unmountOnExit>
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Filtros Inventário
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Armazém</InputLabel>
              <Select defaultValue="todos" label="Armazém">
                <MenuItem value="todos">Todos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Localização</InputLabel>
              <Select defaultValue="todos" label="Localização">
                <MenuItem value="todos">Todos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Situação dos Produtos</InputLabel>
              <Select defaultValue="maior0" label="Situação dos Produtos">
                <MenuItem value="maior0">Saldo maior que 0</MenuItem>
                <MenuItem value="maior1">Saldo &gt; 1</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', height: 40 }}
            >
              Gerar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Layout>
  );
}
