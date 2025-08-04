import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarOcorrencias, criarAuditoria } from '../services/API';
import { useNavigate } from 'react-router-dom';
import ProdutosOcorrenciaModal from '../components/ProdutosOcorrenciaModal';
import ConfirmacaoAuditoria from '../components/ConfirmacaoAuditoria';

interface ProdutoDaOcorrencia {
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  qtd_sistema: number;
  qtd_esperada: number;
  diferenca: number;
  qtd_ocorrencias: number;
  qtd_ocorrencias_produto: number;
  ocorrencia_id: number;
}

interface OcorrenciaItem {
  ocorrencia_id: number;
  localizacao: string;
  armazem: string;
  ativo: boolean;
  prioridade?: 'Baixa' | 'Media' | 'Alta';
  produtos: ProdutoDaOcorrencia[];
  qtd_ocorrencias: number;
  localizacao_id: number;
}

const ITEMS_PER_PAGE = 50;

export default function Ocorrencias() {
  const [busca, setBusca] = useState('');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof OcorrenciaItem>('localizacao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const [localizacaoIdSelecionada, setLocalizacaoIdSelecionada] = useState<number | null>(null);
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<{
    nome: string;
    produtos: ProdutoDaOcorrencia[];
  } | null>(null);

  const [filtroArmazem, setFiltroArmazem] = useState('');
  const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [appliedFiltroPrioridade, setAppliedFiltroPrioridade] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarOcorrencias();

        const agrupado = dados.reduce((acc: OcorrenciaItem[], curr: any) => {
          const existente = acc.find(
            o =>
              o.localizacao === curr.localizacao &&
              o.armazem === curr.armazem &&
              o.ativo === curr.ativo
          );

          const produto = {
            produto_id: curr.produto_id,
            descricao: curr.produto,
            sku: curr.sku,
            ean: curr.ean,
            qtd_esperada: Number(curr.quantidade),
            qtd_sistema: Number(curr.qtd_sistema),
            diferenca: Number(curr.diferenca),
            qtd_ocorrencias: Number(curr.qtd_ocorrencias),
            qtd_ocorrencias_produto: Number(curr.qtd_ocorrencias_produto),
            ocorrencia_id: curr.ocorrencia_id, // ✅ MANTENHA ESSE CAMPO
          };

          if (existente) {
            existente.produtos.push(produto);
          } else {
            acc.push({
              ocorrencia_id: curr.ocorrencia_id, // ✅ USE O ID REAL AQUI
              localizacao: curr.localizacao,
              armazem: curr.armazem,
              ativo: curr.ativo,
              produtos: [produto],
              qtd_ocorrencias: curr.qtd_ocorrencias,
              localizacao_id: curr.localizacao_id,
            });
          }

          return acc;
        }, []);

        const finalComPrioridade = agrupado.map((item: OcorrenciaItem) => ({
          ...item,
          prioridade:
            item.qtd_ocorrencias >= 5
              ? 'Alta'
              : item.qtd_ocorrencias >= 3
                ? 'Media'
                : 'Baixa',
        }));

        setOcorrencias(finalComPrioridade);
      } catch (err) {
        alert('Erro ao carregar ocorrências.');
      }
    }

    carregar();
  }, []);

  const armazens = useMemo(
    () => Array.from(new Set(ocorrencias.map((o) => o.armazem).filter(Boolean))).sort(),
    [ocorrencias]
  );

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroArmazem(filtroArmazem);
    setAppliedFiltroPrioridade(filtroPrioridade);
    setPaginaAtual(1);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroArmazem('');
    setFiltroPrioridade('');
    setAppliedFiltroArmazem('');
    setAppliedFiltroPrioridade('');
    setPaginaAtual(1);
    handleMenuClose();
  };

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return ocorrencias.filter((o) => {
      const matchBusca =
        o.localizacao.toLowerCase().includes(termo) ||
        o.armazem.toLowerCase().includes(termo);

      const matchArmazem =
        !appliedFiltroArmazem ||
        o.armazem.toLowerCase().includes(appliedFiltroArmazem.toLowerCase());

      const matchPrioridade =
        !appliedFiltroPrioridade ||
        o.prioridade?.toLowerCase() === appliedFiltroPrioridade.toLowerCase();

      return matchBusca && matchArmazem && matchPrioridade;
    });
  }, [ocorrencias, busca, appliedFiltroArmazem, appliedFiltroPrioridade]);

  const prioridadeValor = (p: OcorrenciaItem['prioridade']) => {
    if (p === 'Alta') return 3;
    if (p === 'Media') return 2;
    return 1;
  };

  const ordenado = useMemo(() => {
    return [...filtrado].sort((a, b) => {
      let aVal: any = a[orderBy];
      let bVal: any = b[orderBy];

      if (orderBy === 'prioridade') {
        aVal = prioridadeValor(a.prioridade);
        bVal = prioridadeValor(b.prioridade);
      }

      const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
      const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

      if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtrado, orderBy, orderDirection]);

  const totalPaginas = Math.ceil(ordenado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = ordenado.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);

  const handleSort = (property: keyof OcorrenciaItem) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>Ocorrências</Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          placeholder="Busca por localização ou armazém"
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
            backgroundColor:
              appliedFiltroArmazem || appliedFiltroPrioridade ? '#f0f0f0' : 'transparent',
            borderColor:
              appliedFiltroArmazem || appliedFiltroPrioridade ? '#999' : undefined,
            color:
              appliedFiltroArmazem || appliedFiltroPrioridade ? '#333' : undefined,
            fontWeight:
              appliedFiltroArmazem || appliedFiltroPrioridade ? 'bold' : 'normal',
          }}
        >
          Filtro
        </Button>

        {appliedFiltroArmazem && (
          <Chip
            label={`Armazém: ${appliedFiltroArmazem}`}
            color="primary"
            sx={{
              backgroundColor: '#61de27',
              color: '#000',
              fontWeight: 'bold',
              height: 32,
            }}
          />
        )}
        {appliedFiltroPrioridade && (
          <Chip
            label={`Prioridade: ${appliedFiltroPrioridade}`}
            color="secondary"
            sx={{
              backgroundColor:
                appliedFiltroPrioridade === 'Alta' ? '#F44336' :
                  appliedFiltroPrioridade === 'Media' ? '#FF9800' :
                    '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              height: 32,
            }}
          />
        )}

        {(appliedFiltroArmazem || appliedFiltroPrioridade) && (
          <Button variant="outlined" onClick={handleLimparFiltro}>
            Limpar Filtro
          </Button>
        )}

        <Button
          variant="contained"
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => navigate('/NovaOcorrencia')}
        >
          Nova Ocorrência
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box sx={{ p: 2, width: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label="Armazém"
            value={filtroArmazem}
            onChange={(e) => setFiltroArmazem(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {armazens.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Prioridade"
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="Alta">Alta</MenuItem>
            <MenuItem value="Media">Média</MenuItem>
            <MenuItem value="Baixa">Baixa</MenuItem>
          </TextField>

          <Button variant="outlined" onClick={handleAplicarFiltro}>
            Aplicar
          </Button>
        </Box>
      </Menu>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Localização</TableCell>
              <TableCell align="center">Qtd. Ocorrências</TableCell>
              <TableCell align="center">Prioridade</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item, idx) => {
              return (
                <TableRow key={idx}>
                  <TableCell align='center'>{item.armazem} - {item.localizacao}</TableCell>
                  <TableCell align="center">{item.qtd_ocorrencias}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.prioridade}
                      sx={{
                        backgroundColor:
                          item.prioridade === 'Alta' ? '#F44336' :
                            item.prioridade === 'Media' ? '#FF9800' : '#4CAF50',
                        color: '#fff', fontWeight: 600, px: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.ativo ? 'Pendente' : 'Concluído'}
                      size="small"
                      sx={{
                        backgroundColor: item.ativo ? '#FFEB3B' : '#61de27',
                        color: item.ativo ? '#000' : '#fff',
                        fontWeight: 600, px: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setOcorrenciaSelecionada({
                          nome: `${item.armazem} - ${item.localizacao}`,
                          produtos: item.produtos,
                        });
                        setModalAberto(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      Produtos na Ocorrência
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
                      onClick={() => {
                        console.log('📌 Clicou em conferir. ID:', item.localizacao_id);
                        setLocalizacaoIdSelecionada(item.localizacao_id);
                        setConfirmarAberto(true);
                      }}
                    >
                      Criar Auditoria
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {ocorrenciaSelecionada && (
        <ProdutosOcorrenciaModal
          open={modalAberto}
          onClose={() => setModalAberto(false)}
          ocorrenciaNome={ocorrenciaSelecionada.nome}
          produtos={ocorrenciaSelecionada.produtos}
        />
      )}
      <ConfirmacaoAuditoria
        open={confirmarAberto}
        onClose={() => setConfirmarAberto(false)}
        mensagem="Deseja realmente criar esta auditoria?"
        onConfirm={async () => {
          try {
            const usuario_id = 1;
            const localizacao_id = localizacaoIdSelecionada;

            if (!localizacao_id || typeof localizacao_id !== 'number') {
              alert('Localização inválida para criar auditoria.');
              return;
            }

            const entrada = ocorrencias.find(o => o.localizacao_id === localizacao_id);

            if (!entrada) {
              alert('Ocorrência não encontrada.');
              return;
            }

            const novaAuditoria = await criarAuditoria({
              usuario_id,
              localizacao_id,
              ocorrencias: [{ ocorrencia_id: entrada.ocorrencia_id }],
            });

            if (novaAuditoria?.auditoria_id) {
              navigate(`/Auditoria?auditoria_id=${novaAuditoria.auditoria_id}`);
            } else {
              alert('Erro ao redirecionar para a auditoria criada.');
            }

            setConfirmarAberto(false);
          } catch (err: any) {
            console.error('❌ Erro ao criar auditoria:', err);
            alert(err?.response?.data?.message || err.message || 'Erro ao criar auditoria.');
          }
        }}
      />
    </Layout>
  );
}