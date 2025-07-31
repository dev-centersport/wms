import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  registrarConferenciaAuditoria,
  buscarProdutoPorEAN,
  buscarAuditoriaPorId,
  buscarProdutosAuditoria,
  ItemAuditoriaPayload,
} from '../services/API';
import Layout from '../components/Layout';

const ConferenciaAuditoria: React.FC = () => {
  const { id } = useParams();
  const [esperados, setEsperados] = useState<any[]>([]);
  const [bipados, setBipados] = useState<Record<string, number>>({});
  const [produtosMap, setProdutosMap] = useState<Record<string, any>>({});
  const [localizacaoNome, setLocalizacaoNome] = useState('');
  const [armazemNome, setArmazemNome] = useState('');
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [auditoriaId, setAuditoriaId] = useState<number | null>(null);
  const [conclusaoTexto, setConclusaoTexto] = useState('');
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDadosAuditoria() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar dados da auditoria
        const auditoriaData = await buscarAuditoriaPorId(Number(id));
        setAuditoriaId(auditoriaData.auditoria_id);
        
        // Extrair informações da localização
        if (auditoriaData.localizacao) {
          setLocalizacaoNome(auditoriaData.localizacao.nome || '');
          setEanLocalizacao(auditoriaData.localizacao.ean || '');
          
          if (auditoriaData.localizacao.armazem) {
            setArmazemNome(auditoriaData.localizacao.armazem.nome || '');
          }
        }
        
        // Buscar produtos (ocorrências) da auditoria
        const produtosData = await buscarProdutosAuditoria(Number(id));
        
        // Extrair produtos das ocorrências
        const produtos = produtosData.flatMap((ocorrencia: any) => 
          ocorrencia.produto ? [ocorrencia.produto] : []
        );
        
        setEsperados(produtos);
        
      } catch (err: any) {
        console.error('Erro ao carregar dados da auditoria:', err);
        setError('Erro ao carregar dados da auditoria. Verifique se o ID é válido.');
      } finally {
        setLoading(false);
      }
    }

    carregarDadosAuditoria();
  }, [id]);

  const handleBipagem = async (ean: string) => {
    const eanLimpo = ean.trim();
    try {
      const produto = await buscarProdutoPorEAN(eanLimpo, eanLocalizacao);

      if (!produto || !produto.produto_id) {
        alert('Produto com esse EAN não foi encontrado no sistema.');
        return;
      }

      setBipados((prev) => ({
        ...prev,
        [produto.produto_id]: (prev[produto.produto_id] || 0) + 1,
      }));

      setProdutosMap((prev) => ({
        ...prev,
        [produto.produto_id]: produto,
      }));
    } catch {
      alert('Produto com esse EAN não foi encontrado no sistema.');
    }
  };

  const handleChangeMotivo = (produto_id: string, motivo: string) => {
    setMotivos((prev) => ({
      ...prev,
      [produto_id]: motivo,
    }));
  };

  const handleSalvar = async () => {
    if (!auditoriaId) {
      alert('ID da auditoria não encontrado.');
      return;
    }

    const itens: ItemAuditoriaPayload[] = Object.entries(bipados).map(
      ([produto_id, quantidade]) => {
        const produto = produtosMap[produto_id] || {};
        const produtoEsperado = esperados.find((p: any) => p.produto_id === Number(produto_id));
        
        return {
          produto_estoque_id: produto.produto_estoque_id || null,
          quantidade,
          quantidades_sistema: produtoEsperado?.qtd_esperada || 0,
          quantidades_fisico: quantidade,
          motivo_diferenca: motivos[produto_id] || 'outro',
          mais_informacoes: '',
          acao_corretiva: 'Ajuste realizado',
          estoque_anterior: produtoEsperado?.qtd_esperada || 0,
          estoque_novo: quantidade,
        };
      }
    );

    try {
      await registrarConferenciaAuditoria(
        auditoriaId,
        conclusaoTexto.trim() || 'Conferência concluída sem observações.',
        itens
      );
      alert('Conferência registrada com sucesso.');
    } catch (err: any) {
      alert(`Erro ao salvar conferência: ${err?.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <Layout show={false}>
        <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">Carregando dados da auditoria...</Typography>
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout show={false}>
        <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="error">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout show={false}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom fontWeight={'bold'} fontSize={30}>
          Conferência da Auditoria: {armazemNome} - {localizacaoNome}
        </Typography>

        <Box display="flex" gap={5} mt={8}>
          <Box flex={1} component={Paper} p={2}>
            <Typography variant="h6">Produtos Esperados</Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align='center'>Qtd Esperada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {esperados.map((p, index) => (
                    <TableRow key={`${p.produto_id}-${index}`}>
                      <TableCell>{p.sku || '-'}</TableCell>
                      <TableCell>{p.descricao || '-'}</TableCell>
                      <TableCell align='center'>{p.qtd_esperada ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box flex={1} component={Paper} p={2}>
            <Typography variant="h6">Produtos Bipados</Typography>
            <TextField
              fullWidth
              placeholder="Bipe o EAN aqui"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  await handleBipagem((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />

            {/* Caixa com scroll e altura fixa */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Qtd Bipado</TableCell>
                    <TableCell>Motivo Diferença</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(bipados).map(([produto_id, qtd]) => {
                    const produto = produtosMap[produto_id];
                    return (
                      <TableRow key={produto_id}>
                        <TableCell>{produto?.sku || '-'}</TableCell>
                        <TableCell>{produto?.descricao || '-'}</TableCell>
                        <TableCell align="center">{qtd}</TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <InputLabel>Motivo</InputLabel>
                            <Select
                              value={motivos[produto_id] || ''}
                              onChange={(e) => handleChangeMotivo(produto_id, e.target.value)}
                              label="Motivo"
                            >
                              <MenuItem value="estoque zerado">Estoque zerado</MenuItem>
                              <MenuItem value="produto a mais">Produto a mais</MenuItem>
                              <MenuItem value="produto a menos">Produto a menos</MenuItem>
                              <MenuItem value="outro">Outro</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Box>

        <Box component={Paper} mt={5} p={3}>
          <Typography variant="h6" gutterBottom>
            Conclusão da Auditoria
          </Typography>
          <TextField
            label="Observações da Conclusão"
            fullWidth
            multiline
            rows={4}
            value={conclusaoTexto}
            onChange={(e) => setConclusaoTexto(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#4CAF50', color: '#fff', fontWeight: 600 }}
            onClick={handleSalvar}
          >
            Salvar Conferência
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default ConferenciaAuditoria;
