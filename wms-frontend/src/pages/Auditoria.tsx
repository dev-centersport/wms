import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { Search, Add, CheckCircle, Cancel, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import axios from 'axios';
import { buscarAuditoria, buscarArmazemPorEAN } from '../services/API';

interface Ocorrencia {
  ocorrencia_id: number;
  dataHora: string;
  ativo: boolean;
}

export interface AuditoriaItem {
  auditoria_id: number;
  conclusao: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  status: string;
  usuario: {
    responsavel: string;
  };
  localizacao: {
    nome: string;
    ean: string;
  };
  ocorrencias: Ocorrencia[];
  armazem?: {
    nome: string;
  };
}

const ITEMS_PER_PAGE = 10;

export default function Auditoria() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroArmazem, setFiltroArmazem] = useState('');
  const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [appliedFiltroStatus, setAppliedFiltroStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [ocorrenciasModal, setOcorrenciasModal] = useState<{
    open: boolean;
    ocorrencias: Ocorrencia[];
    localizacao: string;
  }>({
    open: false,
    ocorrencias: [],
    localizacao: '',
  });

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarAuditoria({
          search: busca,
          offset: (paginaAtual - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          status: aba === 'pendente' || aba === 'concluido' ? aba : undefined,
        });

        console.log('🔍 Resposta buscarAuditoria:', dados); // Debug

        // Garante que será um array
        const lista: AuditoriaItem[] = Array.isArray(dados)
          ? dados
          : Array.isArray(dados.results)
            ? dados.results
            : [];

        const auditoriasComArmazem = await Promise.all(
          lista.map(async (aud: AuditoriaItem) => {
            let nomeArmazem = '-';

            if (aud.localizacao.ean) {
              const armazemEncontrado = await buscarArmazemPorEAN(aud.localizacao.ean);
              nomeArmazem = armazemEncontrado?.nome || '-';
            }

            return {
              ...aud,
              data_hora_inicio: aud.data_hora_inicio ? formatarData(aud.data_hora_inicio) : '-',
              data_hora_fim: aud.data_hora_fim ? formatarData(aud.data_hora_fim) : '-',
              localizacao: {
                nome: aud.localizacao.nome || '-',
                ean: aud.localizacao.ean || '',
              },
              armazem: {
                nome: nomeArmazem,
              },
              ocorrencias: aud.ocorrencias?.map((oc: Ocorrencia) => ({
                ...oc,
                dataHora: oc.dataHora ? formatarData(oc.dataHora) : '-',
              })) || [],
            };
          })
        );

        setAuditorias(auditoriasComArmazem);
        setSelecionados([]);
      } catch (err) {
        alert('Erro ao carregar auditorias.');
        console.error(err);
      }
    }

    carregar();
  }, [aba, busca, paginaAtual]); // <- inclua dependências relevantes

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroArmazem(filtroArmazem);
    setAppliedFiltroStatus(filtroStatus);
    setPaginaAtual(1);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroArmazem('');
    setFiltroStatus('');
    setAppliedFiltroArmazem('');
    setAppliedFiltroStatus('');
    setPaginaAtual(1);
    handleMenuClose();
  };

  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }

  const abrirModalOcorrencias = (ocorrencias: Ocorrencia[], localizacao: string) => {
    setOcorrenciasModal({
      open: true,
      ocorrencias,
      localizacao,
    });
  };

  const fecharModalOcorrencias = () => {
    setOcorrenciasModal({
      open: false,
      ocorrencias: [],
      localizacao: '',
    });
  };

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return auditorias.filter(aud => {
      const statusMatch = !appliedFiltroStatus || aud.status === appliedFiltroStatus;
      const armazemMatch = !appliedFiltroArmazem || aud.armazem?.nome === appliedFiltroArmazem;
      const buscaMatch =
        aud.usuario.responsavel.toLowerCase().includes(termo) ||
        aud.auditoria_id.toString().includes(termo);

      return statusMatch && armazemMatch && buscaMatch;
    });
  }, [auditorias, busca, appliedFiltroStatus, appliedFiltroArmazem]);

  const totalPaginas = Math.ceil(filtrado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = filtrado.slice(
    (paginaAtual - 1) * ITEMS_PER_PAGE,
    paginaAtual * ITEMS_PER_PAGE
  );

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Auditorias
        </Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          placeholder="Busca por usuário ou ID"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />

        <Button
          variant="outlined"
          onClick={handleMenuOpen}
          sx={{
            minWidth: 110,
            backgroundColor: appliedFiltroArmazem || appliedFiltroStatus ? '#f0f0f0' : 'transparent',
            borderColor: appliedFiltroArmazem || appliedFiltroStatus ? '#999' : undefined,
            color: appliedFiltroArmazem || appliedFiltroStatus ? '#333' : undefined,
            fontWeight: appliedFiltroArmazem || appliedFiltroStatus ? 'bold' : 'normal',
          }}
        >
          Filtro
        </Button>

        {appliedFiltroArmazem && (
          <Chip
            label={`Armazém: ${appliedFiltroArmazem}`}
            sx={{
              backgroundColor: '#61de27',
              color: '#000',
              fontWeight: 'bold',
              height: 32,
            }}
          />
        )}
        {appliedFiltroStatus && (
          <Chip
            label={`Status: ${appliedFiltroStatus === 'concluido' ? 'Concluído' : 'Pendente'}`}
            sx={{
              backgroundColor: appliedFiltroStatus === 'concluido' ? '#4CAF50' : '#FFEB3B',
              color: appliedFiltroStatus === 'concluido' ? '#fff' : '#000',
              fontWeight: 'bold',
              height: 32,
            }}
          />
        )}

        {(appliedFiltroArmazem || appliedFiltroStatus) && (
          <Button variant="outlined" onClick={handleLimparFiltro}>
            Limpar Filtro
          </Button>
        )}

        <Button
          variant="contained"
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => console.log('Nova Auditoria')}
        >
          Nova Auditoria
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box sx={{ p: 2, width: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="concluido">Concluído</MenuItem>
          </TextField>

          <TextField
            select
            label="Armazém"
            value={filtroArmazem}
            onChange={(e) => setFiltroArmazem(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {Array.from(new Set(auditorias.map((a) => a.armazem?.nome).filter(Boolean))).sort().map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={handleAplicarFiltro}>
            Aplicar
          </Button>
        </Box>
      </Menu>


      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab label="Todos" value="todos" />
        <Tab label="Pendentes" value="pendente" />
        <Tab label="Concluídos" value="concluido" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Localização</TableCell>
              <TableCell>Criador</TableCell>
              <TableCell align='center'>Início</TableCell>
              <TableCell align='center'>Término</TableCell>
              <TableCell align='center'>Ocorrências</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell align='center'>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item) => (
              <TableRow key={item.auditoria_id}>
  
                <TableCell>
                  {item.localizacao.nome} - {item.armazem?.nome || '-'}
                </TableCell>
                <TableCell>{item.usuario.responsavel}</TableCell>
                <TableCell align='center'>{item.data_hora_inicio}</TableCell>
                <TableCell align='center'>{item.data_hora_fim}</TableCell>
                <TableCell align='center'>
                  <Button
                    variant="text"
                    onClick={() => abrirModalOcorrencias(item.ocorrencias, item.localizacao.nome)}
                    disabled={!item.ocorrencias || item.ocorrencias.length === 0}
                  >
                    {item.ocorrencias?.length || 0} ocorrência(s)
                  </Button>
                </TableCell>
                <TableCell align='center'>
                  <Chip
                    label={item.status === 'concluido' ? 'Concluído' : 'Pendente'}
                    size="small"
                    sx={{
                      backgroundColor: item.status === 'concluido' ? '#4CAF50' : '#FFEB3B',
                      color: item.status === 'concluido' ? '#fff' : '#000',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align='center'>
                  <Tooltip title="Excluir auditoria">
                    <IconButton
                      size="small"
                      onClick={() => { }}
                      disabled={false}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Ocorrências */}
      <Dialog
        open={ocorrenciasModal.open}
        onClose={fecharModalOcorrencias}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Ocorrências em {ocorrenciasModal.localizacao}
        </DialogTitle>
        <DialogContent>
          {ocorrenciasModal.ocorrencias.length === 0 ? (
            <Typography>Nenhuma ocorrência registrada</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>ID</TableCell>
                    <TableCell align='center'>Data/Hora</TableCell>
                    <TableCell align='center'>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ocorrenciasModal.ocorrencias.map((ocorrencia) => (
                    <TableRow key={ocorrencia.ocorrencia_id}>
                      <TableCell align='center'>{ocorrencia.ocorrencia_id}</TableCell>
                      <TableCell align='center'>{ocorrencia.dataHora}</TableCell>
                      <TableCell align='center'>
                        <Chip
                          label={ocorrencia.ativo === false ? 'Concluído' : 'Pendente'}
                          size="small"
                          sx={{
                            backgroundColor: ocorrencia.ativo === false ? '#4CAF50' : '#FFEB3B',
                            color: ocorrencia.ativo === false ? '#fff' : '#000',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalOcorrencias}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}