import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Checkbox,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Layout from '../components/Layout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../services/API';
import { enviarMovimentacao, buscarProdutoPorEAN, buscarLocalizacaoPorEAN, buscarLocalizacaoGeral, buscarProdutosPorLocalizacaoDireto } from '../services/API';
import CamposTransferencia from '../components/CamposTransferencia';
import { useAuth } from '../contexts/AuthContext';


interface Item {
  produto_id: number;
  produto_estoque_id?: number;
  contador?: string;
  descricao?: string;
  sku: string | null;
  ean: string;
  quantidade?: number;
  produto?: string;
}

interface LocalizacaoOption {
  id: number;
  nome: string;
  ean?: string;
}

const Movimentacao: React.FC = () => {
  const { user } = useAuth();
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'transferencia'>('entrada');

  // Localizações
  const [localizacao, setLocalizacao] = useState('');
  const [origem, setOrigem] = useState<LocalizacaoOption | null>(null);
  const [destino, setDestino] = useState<LocalizacaoOption | null>(null);

  // Autocomplete
  const [options, setOptions] = useState<LocalizacaoOption[]>([]);
  const [loadingOpt, setLoadingOpt] = useState(false);

  // Produtos / lista
  const [produto, setProduto] = useState('');
  const [lista, setLista] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [contadorTotal, setContadorTotal] = useState(1);

  // Confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [localizacaoBloqueada, setLocalizacaoBloqueada] = useState(false);

  // ---------- autocomplete fetch ----------

  const carregarTodasLocalizacoes = async () => {
    try {
      setLoadingOpt(true);
      const response = await api.get('/localizacao?limit=3000');

      const data = response.data;
      console.log('🔍 Resposta da API /localizacao:', data);

      const todas = Array.isArray(response.data.results) ? response.data.results : [];

      const formatadas = todas.map((l: any) => ({
        id: l.localizacao_id,
        nome: l.nome,
        ean: l.ean,
        armazem: l.armazem,
      }));

      setOptions(formatadas);
    } catch (err) {
      console.error('Erro ao carregar localizações:', err);
      setOptions([]);
    } finally {
      setLoadingOpt(false);
    }
  };


  useEffect(() => {
    if (tipo === 'transferencia') {
      carregarTodasLocalizacoes();
    }
  }, [tipo]);

  type ProdutoEstoqueDTO = {
    produto_estoque_id: number;
    produto_id: number;
    descricao: string;
    sku: string;
    ean: string;
    quantidade: number;
  };


  useEffect(() => {
    const carregarProdutosDaOrigem = async () => {
      if (tipo !== 'transferencia' || !origem?.id) return;

      try {
        const produtos = await buscarProdutosPorLocalizacaoDireto(origem.id);

        const listaConvertida: Item[] = produtos.map((item: ProdutoEstoqueDTO, index: number) => ({
          produto_id: item.produto_id,
          produto_estoque_id: item.produto_estoque_id,
          sku: item.sku,
          ean: item.ean,
          descricao: item.descricao,
          produto: item.descricao,
          quantidade: Math.max(item.quantidade || 0, 1), // ✅ Garante quantidade mínima de 1
          contador: String(index + 1).padStart(3, '0'),
        }));

        setLista(listaConvertida);
        setSelectedItems(listaConvertida.map((_, i) => i));
        setContadorTotal(listaConvertida.length + 1);
      } catch (error) {
        console.error('Erro ao buscar produtos da localização de origem:', error);
        alert('Erro ao carregar os produtos da localização de origem.');
      }
    };

    carregarProdutosDaOrigem();
  }, [origem, tipo]);



  // ---------- Handlers ----------

  const handleAdicionarProduto = async () => {
    if (!produto) return;

    const eanLimpo = produto.trim();

    const novo = await buscarProdutoPorEAN(eanLimpo, origem?.ean || localizacao);

    if (!novo) {
      alert(`Produto com EAN ${eanLimpo} não encontrado.`);
      setProduto('');
      return;
    }

    setLista((prevLista: Item[]) => {
      const novaLista: Item[] = [
        ...prevLista,
        {
          produto_id: novo.produto_id,
          produto_estoque_id: novo.produto_estoque_id, // <- ESSENCIAL
          sku: novo.sku,
          ean: novo.ean,
          descricao: novo.descricao,
          quantidade: 1, // ✅ Corrigido: quantidade inicial como 1
          produto: novo.descricao,
          contador: String(contadorTotal).padStart(3, '0'),
        },
      ];
      setSelectedItems((prev) => [...prev, novaLista.length - 1]);
      return novaLista;
    });

    setContadorTotal((prev) => prev + 1);
    setProduto('');
  };

  const handleBuscarLocalizacao = async () => {
  if (!localizacao.trim()) return;

  const eanLocalizacao = localizacao.trim();
  let resultado;

  try {
    // Busca a localização (entrada, saída ou transferência)
    if (tipo === 'transferencia') {
      resultado = await buscarLocalizacaoGeral(eanLocalizacao);
    } else {
      resultado = await buscarLocalizacaoPorEAN(eanLocalizacao);
    }

    if (!resultado) {
      alert(`Localização com EAN ${eanLocalizacao} não encontrada.`);
      return;
    }

    // Tenta abrir a localização no backend
    try {
      await api.get(`/movimentacao/abrir-localizacao/${eanLocalizacao}`);
    } catch (erro: any) {
      alert(erro?.response?.data?.message || 'A localização já está em uso.');
      return;
    }

    setOrigem({
      id: resultado.localizacao_id,
      nome: resultado.nome,
      ean: eanLocalizacao,
    });

    setLocalizacao('');
    setLocalizacaoBloqueada(true);

  } catch (err: any) {
    console.error('Erro ao buscar localização:', err);
    alert(err?.message || 'Erro ao buscar localização.');
  }
};



  const handleExcluir = (index: number) => {
    setLista((prev) => prev.filter((_, i) => i !== index));
    setSelectedItems((prev) => prev.filter((i) => i !== index));
  };

  const handleEditar = (item: Item) => {
    alert(`Abrir edição para SKU/EAN: ${item.sku || item.ean}`);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? lista.map((_, i) => i) : []);
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, index] : prev.filter((i) => i !== index)));
  };

  const handleSalvarClick = () => {
    

    let mensagem = '';
    switch (tipo) {
      case 'entrada':
        mensagem = 'Confirmar ENTRADA dos produtos selecionados?';
        break;
      case 'saida':
        mensagem = 'Confirmar SAÍDA dos produtos selecionados?';
        break;
      case 'transferencia':
        mensagem = 'Confirmar TRANSFERÊNCIA dos produtos selecionados?';
        break;
      default:
        mensagem = 'Confirmar operação?';
    }
    setConfirmMessage(mensagem);
    setConfirmOpen(true);
  };
  


  const handleConfirmarOperacao = async () => {
  try {
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    // ✅ Validação adicional para garantir quantidades positivas
    const itensComQuantidadeValida = lista.map((item) => {
      // Garante que a quantidade seja um número válido e positivo
      let quantidade = Number(item.quantidade);
      
      // Se não for um número válido ou for menor/igual a 0, define como 1
      if (isNaN(quantidade) || quantidade <= 0) {
        quantidade = 1;
      }
      
      return {
        produto_id: Number(item.produto_id),
        produto_estoque_id: Number(item.produto_estoque_id),
        quantidade: quantidade,
      };
    });

    const payload: any = {
      tipo,
      usuario_id: user.usuario_id, // 🔒 Usando o ID do usuário autenticado
      itens_movimentacao: itensComQuantidadeValida,
      localizacao_origem_id: 0,
      localizacao_destino_id: 0,
    };

    if (tipo === 'entrada') {
      payload.localizacao_origem_id = 0;
      payload.localizacao_destino_id = origem?.id || parseInt(localizacao);
    } else if (tipo === 'saida') {
      payload.localizacao_origem_id = origem?.id || parseInt(localizacao);
      payload.localizacao_destino_id = 0;
    } else if (tipo === 'transferencia') {
      payload.localizacao_origem_id = origem?.id;
      payload.localizacao_destino_id = destino?.id;
    }

    console.log('📦 Payload final:', payload);

    await enviarMovimentacao(payload);

    // ✅ FECHAR LOCALIZAÇÕES
    try {
      if (origem?.ean) {
        await api.get(`/movimentacao/fechar-localizacao/${origem.ean}`);
      }

      if (tipo === 'transferencia' && destino?.ean) {
        await api.get(`/movimentacao/fechar-localizacao/${destino.ean}`);
      }
    } catch (erro) {
      console.warn('⚠️ Erro ao tentar fechar a localização:', erro);
    }

    alert('Movimentacao realizada com sucesso!');
    setConfirmOpen(false);
    setLista([]);
    setOrigem(null);
    setDestino(null);
    setLocalizacao('');
    setLocalizacaoBloqueada(false);
    setContadorTotal(1);
  } catch (err: any) {
    console.error('Erro ao enviar movimentacao:', err);
    if (err.response) {
      console.error('📛 Código:', err.response.status);
      console.error('📦 Dados do erro:', err.response.data);
    }
    alert(err?.response?.data?.message || 'Falha ao salvar movimentacao.');
  }
};



  // ---------- UI ----------
  return (
    <Layout>
      <Box sx={{ width: '100%', maxWidth: '1280px' }}>
        <Typography variant="h4" fontWeight={600} mb={4}>
          {tipo === 'transferencia' ? 'Transferência de Estoque' : 'Movimentação de Estoque'}
        </Typography>

        {/* Seção de campos */}
        <Box display="flex" flexDirection="column" gap={3} mb={5}>
          {/* Tipo */}
          <FormControl fullWidth size="small">
            <InputLabel id="tipo-label">Tipo</InputLabel>
            <Select
              labelId="tipo-label"
              value={tipo}
              label="Tipo"
              onChange={(e) => {
                setTipo(e.target.value as any);
                setLista([]);
                setOrigem(null);
                setDestino(null);
                setLocalizacao('');
              }}
              sx={{ backgroundColor: '#ffffff', borderRadius: 2, height: 45 }}
            >
              <MenuItem value="entrada">Entrada</MenuItem>
              <MenuItem value="saida">Saída</MenuItem>
              <MenuItem value="transferencia">Transferência</MenuItem>
            </Select>
          </FormControl>

          {/* Entrada / Saída - Localização simples */}
          {tipo === 'transferencia' && (
            <CamposTransferencia
              tipo={tipo}
              origem={origem}
              destino={destino}
              setOrigem={setOrigem}
              setDestino={setDestino}
            />
          )}

          {tipo !== 'transferencia' && (
            <>
              <TextField
                fullWidth
                label="Bipe a Localização"
                size="small"
                value={localizacaoBloqueada ? origem?.nome || '' : localizacao}
                onChange={(e) => !localizacaoBloqueada && setLocalizacao(e.target.value)}
                onKeyDown={(e) => !localizacaoBloqueada && e.key === 'Enter' && handleBuscarLocalizacao()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  readOnly: localizacaoBloqueada,
                }}
                sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
              />
              {origem && (
                <Box
                  sx={{
                    backgroundColor: '#e3f3dc',
                    border: '2px solid #61de27',
                    borderRadius: 2,
                    padding: 2,
                    mt: 1,
                    fontWeight: 500,
                  }}
                >
                  Localização identificada: <strong>{origem.nome}</strong>
                </Box>
              )}

              <TextField
                fullWidth
                label="Bipe o Produto"
                size="small"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdicionarProduto()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
              />
            </>
          )}

        </Box>

        {/* Tabela */}
        <Typography textAlign="center" variant="h6" fontWeight="bold" mb={1}>
          {tipo === 'transferencia' ? 'Produtos a serem movimentados' : 'Lista de Movimentação'}
        </Typography>

        <Paper elevation={1} sx={{ mb: 5, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < lista.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>

                {tipo === 'transferencia' ? (
                  <>
                    <TableCell><strong>Quantidade</strong></TableCell>
                    <TableCell><strong>Produto</strong></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell><strong>Contador</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                  </>
                )}
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>EAN</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {lista.map((item, index) => {
                const isSelected = selectedItems.includes(index);
                return (
                  <TableRow key={`${item.ean}-${index}`} hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(index, e.target.checked)}
                      />
                    </TableCell>

                    {tipo === 'transferencia' ? (
                      <>
                        <TableCell>{item.quantidade ?? 1}</TableCell>
                        <TableCell>{item.produto ?? item.ean}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.contador}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                      </>
                    )}

                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.ean}</TableCell>

                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditar(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => handleExcluir(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* Botões */}
        <Box display="flex" justifyContent="flex-start" gap={4} mt={6} mb={4}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', px: 4 }}
            onClick={handleSalvarClick}
          >
            Salvar
          </Button>
          <Button variant="outlined" sx={{ px: 4, fontWeight: 'bold', backgroundColor: '#f5f5f5', color: '#000' }}>
            Cancelar
          </Button>
        </Box>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '2px solid #61de27',
              overflow: 'hidden',
              boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#61de27',
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
              Confirmação
            </Typography>
            <IconButton onClick={() => setConfirmOpen(false)} size="small">
              <Typography sx={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>×</Typography>
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              textAlign: 'center',
              py: 5,
              backgroundColor: '#fff',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 56, color: '#000', mb: 2 }} />
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: '#333' }}>
              {confirmMessage}
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
            <Button
              onClick={handleConfirmarOperacao}
              sx={{
                backgroundColor: '#61de27',
                color: '#000',
                fontWeight: 'bold',
                fontSize: 16,
                textTransform: 'none',
                px: 6,
                py: 1.7,
                borderRadius: '10px',
                boxShadow: '0 6px 12px rgba(97, 222, 39, 0.4)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: '#4ec51f',
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 16px rgba(78, 197, 31, 0.5)',
                },
              }}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Movimentacao;