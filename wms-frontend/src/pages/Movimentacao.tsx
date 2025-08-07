import React, { useEffect, useState, useCallback } from 'react';
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
  DialogActions,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Layout from '../components/Layout';
import Header from '../components/Header';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import axios from 'axios';
import api from '../services/API';
import {
  enviarMovimentacao, buscarProdutoPorEAN, buscarLocalizacaoPorEAN, buscarLocalizacaoGeral,
  buscarProdutosPorLocalizacaoDireto, getCurrentUser, abrirLocalizacao, fecharLocalizacao
} from '../services/API';
import CamposTransferencia from '../components/CamposTransferencia';
import Sidebar from '../components/Sidebar';
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

interface ProdutoBusca {
  produto_id: number;
  produto_estoque_id?: number;
  sku: string;
  ean: string;
  descricao: string;
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

  // Modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Estado para controlar a localização aberta (SOMENTE UMA)
  const [eanLocalizacaoAberta, setEanLocalizacaoAberta] = useState<string | null>(null);
  const [editingQuantidade, setEditingQuantidade] = useState<number>(1);

  // Loading states
  const [loading, setLoading] = useState(false);

  // ---------- autocomplete fetch ----------

  // Função para verificar se uma localização está aberta
  const verificarLocalizacaoAberta = useCallback(async (ean: string) => {
    try {
      const response = await api.get(`/localizacao?ean=${ean}`);
      const localizacao = response.data.results?.find((l: any) => l.ean === ean);
      return localizacao?.status === 'aberta';
    } catch (erro) {
      console.warn('Erro ao verificar status da localização:', erro);
      return false;
    }
  }, []);

  // Função para fechar localização aberta
  const fecharLocalizacaoAberta = useCallback(async () => {
    if (!eanLocalizacaoAberta) return;

    console.log('🔒 Fechando localização aberta:', eanLocalizacaoAberta);

    try {
      // Verificar se a localização ainda está aberta antes de tentar fechar
      const estaAberta = await verificarLocalizacaoAberta(eanLocalizacaoAberta);
      if (estaAberta) {
        await fecharLocalizacao(eanLocalizacaoAberta);
        console.log(`✅ Localização ${eanLocalizacaoAberta} fechada com sucesso`);
      } else {
        console.log(`ℹ️ Localização ${eanLocalizacaoAberta} já estava fechada`);
      }
    } catch (erro) {
      console.warn(`⚠️ Erro ao fechar localização ${eanLocalizacaoAberta}:`, erro);
    }

    setEanLocalizacaoAberta(null);
  }, [verificarLocalizacaoAberta, eanLocalizacaoAberta]);

  // Função para limpar estado e fechar localização
  const limparEstado = useCallback(async () => {
    console.log('🧹 Limpando estado da movimentação');

    // Fechar localização aberta
    await fecharLocalizacaoAberta();

    // Limpar estado
    setLista([]);
    setOrigem(null);
    setDestino(null);
    setLocalizacao('');
    setLocalizacaoBloqueada(false);
    setContadorTotal(1);
    setSelectedItems([]);
    setSelectAll(false);
    setProduto('');
  }, [fecharLocalizacaoAberta]);

  // ALERTA ao usuário se tentar sair/recarregar com localização aberta
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (eanLocalizacaoAberta) {
        event.preventDefault();
        event.returnValue = 'Há uma localização aberta! Cancele ou conclua a movimentação antes de sair.';
        return 'Há uma localização aberta! Cancele ou conclua a movimentação antes de sair.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [eanLocalizacaoAberta]);

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

    let novo: ProdutoBusca | null = null;
    if (tipo === 'entrada') {
      novo = await buscarProdutoPorEAN(eanLimpo);
    } else {
      novo = await buscarProdutoPorEAN(eanLimpo, origem?.ean || localizacao);
    }

    if (!novo) {
      alert('Produto não encontrado!');
      setProduto('');
      return;
    }

    if (tipo !== 'entrada' && !novo.produto_estoque_id) {
      alert('Produto não encontrado nesta localização para saída ou transferência.');
      setProduto('');
      return;
    }

    // O TypeScript já sabe que novo não é mais null neste ponto!
    setLista((prevLista: Item[]) => {
      const novaLista: Item[] = [
        ...prevLista,
        {

          produto_id: novo!.produto_id,
          // Se não houver produto_estoque_id (caso entrada), envia 0
          produto_estoque_id: novo!.produto_estoque_id ? novo!.produto_estoque_id : 0,
          sku: novo!.sku,
          ean: novo!.ean,
          descricao: novo!.descricao,
          quantidade: 1,
          produto: novo!.descricao,

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

      console.log('🔍 Buscando localização:', eanLocalizacao);


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

      console.log('✅ Localização encontrada:', resultado);

      // Usa função centralizada para abrir localização
      try {
        console.log('🔓 Abrindo localização:', eanLocalizacao);
        await abrirLocalizacao(eanLocalizacao);
        console.log('✅ Localização aberta com sucesso');

        // Define a localização aberta
        setEanLocalizacaoAberta(eanLocalizacao);

        setOrigem({
          id: resultado.localizacao_id,
          nome: resultado.nome,
          ean: eanLocalizacao,
        });

        setLocalizacao('');
        setLocalizacaoBloqueada(true);
      } catch (erro: any) {
        console.error('❌ Erro ao abrir localização:', erro);
        const mensagem = erro?.response?.data?.message || erro?.message || 'A localização já está em uso.';
        alert(mensagem);
        return;
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar localização:', err);
      alert(err?.message || 'Erro ao buscar localização.');
    }
  };

  const handleExcluir = (index: number) => {
    setLista((prev) => prev.filter((_, i) => i !== index));
    setSelectedItems((prev) => prev.filter((i) => i !== index));
  };

  const handleEditar = (item: Item) => {
    setEditingItem(item);
    setEditingQuantidade(item.quantidade || 1);
    setEditModalOpen(true);
  };

  const handleSalvarEdicao = () => {
    if (!editingItem || editingQuantidade <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    setLista((prevLista) =>
      prevLista.map((item) =>
        item === editingItem
          ? { ...item, quantidade: editingQuantidade }
          : item
      )
    );

    setEditModalOpen(false);
    setEditingItem(null);
    setEditingQuantidade(1);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? lista.map((_, i) => i) : []);
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, index] : prev.filter((i) => i !== index)));
  };

  const handleSalvarClick = () => {
    // Validar se todos os itens têm quantidade > 0
    const itensComQuantidadeInvalida = lista.filter(item => !item.quantidade || item.quantidade <= 0);
    if (itensComQuantidadeInvalida.length > 0) {
      alert('Todos os produtos devem ter quantidade maior que zero. Use o botão de editar para ajustar as quantidades.');
      return;
    }

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

  const handleCancelarMovimentacao = async () => {
    console.log('❌ Cancelando movimentação');
    await limparEstado();
    console.log('✅ Movimentação cancelada e localizações fechadas');
  };


  const handleMudancaTipo = async (novoTipo: 'entrada' | 'saida' | 'transferencia') => {
    console.log('🔄 Mudando tipo de movimentação de', tipo, 'para', novoTipo);


    // Fechar localização aberta antes de mudar o tipo
    await fecharLocalizacaoAberta();

    // Limpar estado
    setLista([]);
    setOrigem(null);
    setDestino(null);
    setLocalizacao('');
    setLocalizacaoBloqueada(false);
    setSelectedItems([]);
    setSelectAll(false);
    setProduto('');

    // Mudar o tipo
    setTipo(novoTipo);

    console.log('✅ Tipo alterado e estado limpo');
  };

  const handleConfirmarOperacao = async () => {
    try {

      setLoading(true);
      console.log('✅ Confirmando operação de movimentação');

      // Buscar o usuário logado
      const currentUser = await getCurrentUser();
      const usuario_id = currentUser.usuario_id;

      // Validar se todos os itens têm produto_estoque_id
      const itensSemEstoqueId = lista.filter(item => {
        // Só precisa de produto_estoque_id para saída e transferência
        if (tipo === 'entrada') return false;
        return !item.produto_estoque_id;
      });
      if (itensSemEstoqueId.length > 0) {
        alert('Alguns produtos não possuem ID de estoque válido. Remova e adicione novamente.');
        setLoading(false);
        return;
      }

      const payload: any = {
        tipo,
        usuario_id, // OBRIGATÓRIO
        itens_movimentacao: lista.map((item) => ({
          produto_id: Number(item.produto_id),
          quantidade: Number(item.quantidade ?? 1),
          // Sempre envie, mesmo que seja 0
          produto_estoque_id: Number(item.produto_estoque_id) || 0,
        })),
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

      // ✅ FECHAR LOCALIZAÇÃO
      console.log('🔒 Fechando localização após movimentação concluída');
      await fecharLocalizacaoAberta();

      alert('Movimentacao realizada com sucesso!');
      setConfirmOpen(false);

      // Limpar estado após sucesso
      await limparEstado();

      console.log('✅ Movimentação concluída com sucesso');
    } catch (err: any) {
      console.error('❌ Erro ao enviar movimentacao:', err);
      if (err.response) {
        console.error('📛 Código:', err.response.status);
        console.error('📦 Dados do erro:', err.response.data);
      }
      alert(err?.response?.data?.message || 'Falha ao salvar movimentacao.');
    } finally {
      setLoading(false);
    }
  };



  // ---------- UI ----------
  return (
    <Sidebar gavetaAberta={!!eanLocalizacaoAberta}>
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header com informações do usuário e logout */}
        <Header title={tipo === 'transferencia' ? 'Transferência de Estoque' : 'Movimentação de Estoque'} />
        
        <Box sx={{ 
          flex: 1, 
          p: 3,
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
        }}>
      <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', p: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <InventoryIcon sx={{ fontSize: 32, color: '#black' }} />
          <Typography variant="h4" fontWeight={600} color="black">
            {tipo === 'transferencia' ? 'Transferência de Estoque' : 'Movimentação de Estoque'}
          </Typography>
        </Box>

        {/* Tipo de Movimentação */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#black' }}>
                Tipo de Operação
              </Typography>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel id="tipo-label">Tipo</InputLabel>
              <Select
                labelId="tipo-label"
                value={tipo}
                label="Tipo"
                onChange={(e) => {
                  const novoTipo = e.target.value as any;
                  handleMudancaTipo(novoTipo);
                }}
                sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
              >
                <MenuItem value="entrada">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon sx={{ color: '#4caf50' }} />
                    Entrada
                  </Box>
                </MenuItem>
                <MenuItem value="saida">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteIcon sx={{ color: '#f44336' }} />
                    Saída
                  </Box>
                </MenuItem>
                <MenuItem value="transferencia">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: '#ff9800' }} />
                    Transferência
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Campos de Localização */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
          {tipo === 'transferencia' ? (
            <CamposTransferencia
              tipo={tipo}
              origem={origem}
              destino={destino}
              setOrigem={setOrigem}
              setDestino={setDestino}
              onLocalizacaoAberta={(ean) => setEanLocalizacaoAberta(ean)}
            />
          ) : (
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#black' }}>
                      {tipo === 'entrada' ? 'Localização de Destino' : 'Localização de Origem'}
                    </Typography>
                    <TextField
                      fullWidth
                      label={`Bipe a Localização ${tipo === 'entrada' ? 'de Destino' : 'de Origem'}`}
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
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Localização identificada: <strong>{origem.nome}</strong>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#black' }}>
                      Produto
                    </Typography>
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
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </Box>

        {/* Lista de Produtos */}
        {lista.length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="black">
                  {tipo === 'transferencia' ? 'Produtos a serem movimentados' : 'Lista de Movimentação'}
                </Typography>
                <Chip
                  label={`${lista.length} produto${lista.length > 1 ? 's' : ''}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
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
                            <TableCell>
                              <Typography
                                sx={{
                                  color: !item.quantidade || item.quantidade <= 0 ? '#ff3d00' : '#000',
                                  fontWeight: !item.quantidade || item.quantidade <= 0 ? 'bold' : 'normal',
                                }}
                              >
                                {item.quantidade ?? 1}
                              </Typography>
                            </TableCell>
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
                          <Tooltip title="Editar Quantidade">
                            <IconButton onClick={() => handleEditar(item)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton onClick={() => handleExcluir(index)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Botões de Ação */}
        <Box display="flex" justifyContent="flex-start" gap={2} mt={3}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSalvarClick}
            disabled={lista.length === 0 || loading}
            sx={{
              backgroundColor: '#4caf50',
              color: '#fff',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancelarMovimentacao}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#f5f5f5',
              color: '#666',
              borderRadius: 2,
              borderColor: '#ddd',
              '&:hover': {
                backgroundColor: '#e0e0e0',
                borderColor: '#999'
              }
            }}
          >
            Cancelar
          </Button>
        </Box>

        {/* Modal de Confirmação */}
        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '2px solid #4caf50',
              overflow: 'hidden',
              boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#4caf50',
              px: 3,
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              Confirmação
            </Typography>
            <IconButton onClick={() => setConfirmOpen(false)} size="small">
              <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>×</Typography>
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              textAlign: 'center',
              py: 4,
              backgroundColor: '#fff',
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#333', mb: 2 }}>
              {confirmMessage}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666' }}>
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outlined"
              sx={{
                mr: 2,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                borderColor: '#ddd',
                color: '#666',
                '&:hover': { borderColor: '#999' }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarOperacao}
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#4caf50',
                color: '#fff',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { backgroundColor: '#45a049' },
                '&:disabled': { backgroundColor: '#ccc' }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Edição de Quantidade */}
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: '2px solid #1976d2',
              overflow: 'hidden',
              boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#1976d2',
              px: 3,
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              Editar Quantidade
            </Typography>
            <IconButton onClick={() => setEditModalOpen(false)} size="small">
              <Typography sx={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>×</Typography>
            </IconButton>
          </Box>

          <DialogContent
            sx={{
              py: 4,
              backgroundColor: '#fff',
            }}
          >
            {editingItem && (
              <Box>
                <Typography sx={{ fontSize: 16, color: '#333', mb: 2, fontWeight: 500 }}>
                  Produto: <strong>{editingItem.descricao || editingItem.ean}</strong>
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#666', mb: 3 }}>
                  SKU: <strong>{editingItem.sku}</strong> | EAN: <strong>{editingItem.ean}</strong>
                </Typography>

                <TextField
                  fullWidth
                  label="Quantidade"
                  type="number"
                  value={editingQuantidade}
                  onChange={(e) => setEditingQuantidade(Number(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
            <Button
              onClick={() => setEditModalOpen(false)}
              variant="outlined"
              sx={{
                mr: 2,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                borderColor: '#ddd',
                color: '#666',
                '&:hover': { borderColor: '#999' }
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarEdicao}
              variant="contained"
              sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </Box>
    </Sidebar>
  );
};

export default Movimentacao;