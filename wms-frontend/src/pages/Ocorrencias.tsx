import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
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
  TableSortLabel,
  Menu,
  MenuItem,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarOcorrencias } from '../services/API';
import { useNavigate } from 'react-router-dom';
import ProdutosOcorrenciaModal from '../components/ProdutosOcorrenciaModal';

interface ProdutoDaOcorrencia {
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  qtd_sistema: number;
  qtd_esperada: number;
  diferenca: number;
  qtd_ocorrencias: number;
  qtd_ocorrencias_produto: number
}

interface OcorrenciaItem {
  id: number;
  localizacao: string;
  armazem: string;
  ativo: boolean;
  prioridade?: 'Baixa' | 'Media' | 'Alta';
  produtos: ProdutoDaOcorrencia[];
  qtd_ocorrencias: number;
}

const ITEMS_PER_PAGE = 50;

export default function Ocorrencias() {
  const [busca, setBusca] = useState('');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof OcorrenciaItem>('localizacao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [modalAberto, setModalAberto] = useState(false);
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
          };

          if (existente) {
            existente.produtos.push(produto);
          } else {
            acc.push({
              id: acc.length + 1,
              localizacao: curr.localizacao,
              armazem: curr.armazem,
              ativo: curr.ativo,
              produtos: [produto],
              qtd_ocorrencias: curr.qtd_ocorrencias,
            });
          }

          return acc;
        }, []);

        const finalComPrioridade = agrupado.map((item: OcorrenciaItem) => ({
          ...item,
          prioridade:
            item.qtd_ocorrencias>= 5
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
              <TableCell align='center' sortDirection={orderBy === 'localizacao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'localizacao'}
                  direction={orderBy === 'localizacao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('localizacao')}
                >
                  Localização
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'qtd_ocorrencias' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'qtd_ocorrencias'}
                  direction={orderBy === 'qtd_ocorrencias' ? orderDirection : 'asc'}
                  onClick={() => handleSort('qtd_ocorrencias' as keyof OcorrenciaItem)}
                >
                  Qtd. Ocorrências
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'prioridade' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'prioridade'}
                  direction={orderBy === 'prioridade' ? orderDirection : 'asc'}
                  onClick={() => handleSort('prioridade')}
                >
                  Prioridade
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'ativo' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'ativo'}
                  direction={orderBy === 'ativo' ? orderDirection : 'asc'}
                  onClick={() => handleSort('ativo')}
                >
                  Status
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell align='center' sx={{pr: orderBy === 'localizacao' ? 'auto' : '33px'}}>{item.armazem} - {item.localizacao}</TableCell>
                <TableCell align="center" sx={{pr: orderBy === 'qtd_ocorrencias' ? 'auto' : '33px'}}>{item.qtd_ocorrencias}</TableCell>
                <TableCell align="center"  sx={{pr: orderBy === 'prioridade' ? 'auto' : '33px'}}>
                  <Chip
                    label={item.prioridade}
                    sx={{
                      backgroundColor:
                        item.prioridade === 'Alta' ? '#F44336' :
                          item.prioridade === 'Media' ? '#FF9800' : '#4CAF50',
                      color: '#fff',
                      fontWeight: 600,
                      px: 2,
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{pr: orderBy === 'ativo' ? 'auto' : '33px'}}>
                  <Chip
                    label={item.ativo ? 'Pendente' : 'Concluído'}
                    size="small"
                    sx={{
                      backgroundColor: item.ativo ? '#FFEB3B' : '#61de27',
                      color: item.ativo ? '#000' : '#fff',
                      fontWeight: 600,
                      px: 2,
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
                  >
                    Produtos na Ocorrência
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
    </Layout>
  );
}
