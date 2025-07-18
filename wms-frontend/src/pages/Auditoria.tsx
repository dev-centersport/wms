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
} from '@mui/material';
import { Search, CheckCircle, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarAuditoria, AuditoriaItem, Ocorrencia } from '../services/API';




const ITEMS_PER_PAGE = 10;

export default function Auditoria() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
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
        const dados = await buscarAuditoria();
        const auditoriasFormatadas = dados.map((aud: AuditoriaItem) => ({
          ...aud,
          data_hora_inicio: aud.data_hora_inicio ? formatarData(aud.data_hora_inicio) : '-',
          data_hora_fim: aud.data_hora_fim ? formatarData(aud.data_hora_fim) : '-',
          ocorrencias: aud.ocorrencias?.map((oc: Ocorrencia) => ({
            ...oc,
            dataHora: oc.dataHora ? formatarData(oc.dataHora) : '-',
          })) || [],
        }));
        setAuditorias(auditoriasFormatadas);
        setSelecionados([]);
      } catch (err) {
        alert('Erro ao carregar auditorias.');
      }
    }

    carregar();
  }, [aba]);

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
    return auditorias.filter((aud) => {
      const statusMatch = aba === 'todos' || aud.status === aba;
      const buscaMatch =
        aud.usuario.responsavel.toLowerCase().includes(termo) ||
        aud.auditoria_id.toString().includes(termo);
      return statusMatch && buscaMatch;
    });
  }, [auditorias, busca, aba]);

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
      {/* ... conteúdo da página mantido igual ... */}

      {/* Modal de Ocorrências */}
      {/* ... mantido igual ... */}

      <Box display="flex" mt={3} gap={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          disabled={selecionados.length === 0}
        >
          Conferir Selecionado
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Cancel />}
          onClick={() => setSelecionados([])}
        >
          Cancelar
        </Button>
      </Box>
    </Layout>
  );
}

