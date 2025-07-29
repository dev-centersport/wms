import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  nome: string;
  perfil: string;
}

const ITEMS_PER_PAGE = 50;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [appliedFiltroPerfil, setAppliedFiltroPerfil] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUsuarios([]); // Deixe vazio, dados reais devem vir da API futuramente
  }, []);

  const perfis = useMemo(() => {
    return Array.from(new Set(usuarios.map(u => u.perfil).filter(Boolean))).sort();
  }, [usuarios]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroPerfil(filtroPerfil);
    setPaginaAtual(1);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroPerfil('');
    setAppliedFiltroPerfil('');
    setPaginaAtual(1);
    handleMenuClose();
  };

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return usuarios.filter(u => {
      const matchBusca =
        u.nome.toLowerCase().includes(termo) ||
        u.perfil.toLowerCase().includes(termo);
      const matchPerfil =
        !appliedFiltroPerfil ||
        u.perfil.toLowerCase().includes(appliedFiltroPerfil.toLowerCase());
      return matchBusca && matchPerfil;
    });
  }, [usuarios, busca, appliedFiltroPerfil]);

  const totalPaginas = Math.ceil(filtrado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = filtrado.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>Usuários</Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          placeholder="Busca por nome ou perfil"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ width: 400 }}
        />

        <Button
          variant="outlined"
          onClick={handleMenuOpen}
          sx={{
            minWidth: 110,
            backgroundColor: appliedFiltroPerfil ? '#f0f0f0' : 'transparent',
            borderColor: appliedFiltroPerfil ? '#999' : undefined,
            color: appliedFiltroPerfil ? '#333' : undefined,
            fontWeight: appliedFiltroPerfil ? 'bold' : 'normal',
          }}
        >
          Filtro
        </Button>

        {appliedFiltroPerfil && (
          <Chip
            label={`Perfil: ${appliedFiltroPerfil}`}
            sx={{
              backgroundColor: '#61de27',
              color: '#000',
              fontWeight: 'bold',
              height: 32,
            }}
          />
        )}

        {appliedFiltroPerfil && (
          <Button variant="outlined" onClick={handleLimparFiltro}>
            Limpar Filtro
          </Button>
        )}

        <Button
          variant="contained"
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => navigate('/NovoUsuario')}
        >
          Novo Usuário
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box sx={{ p: 2, width: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Perfil do Usuário"
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {perfis.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={handleAplicarFiltro}>Aplicar</Button>
        </Box>
      </Menu>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Perfil do Usuário</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((usuario, index) => (
              <TableRow key={index}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.perfil}</TableCell>
                <TableCell align="center">
                  <IconButton><Edit /></IconButton>
                  <IconButton><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}
