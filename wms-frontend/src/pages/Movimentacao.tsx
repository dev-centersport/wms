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
import { enviarMovimentacao, buscarProdutoPorEAN, buscarLocalizacaoPorEAN, buscarLocalizacoes, buscarProdutosPorLocalizacaoDireto, buscarProdutoEstoquePorId } from '../services/API';


interface Item {
  produto_id?: number; // para entrada/saída
  produto_estoque_id?: number; // para transferência
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
  armazem: string;
}

const Movimentacao: React.FC = () => {
  const [tipo, setTipo] = useState<'entrada' | 'saida' | 'transferencia'>('entrada');

  // Localizações
  const [localizacao, setLocalizacao] = useState('');
  const [origem, setOrigem] = useState<LocalizacaoOption | null>(null);
  const [destino, setDestino] = useState<LocalizacaoOption | null>(null);

  // Autocomplete
  const [options, setOptions] = useState<LocalizacaoOption[]>([]);
  const [loadingOpt, setLoadingOpt] = useState(false);
  const [inputOrigem, setInputOrigem] = useState('');
  const [inputDestino, setInputDestino] = useState('');


  // Produtos / lista
  const [produto, setProduto] = useState('');
  const [lista, setLista] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [produtosOrigem, setProdutosOrigem] = useState<Item[]>([]);

  // Confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [localizacaoBloqueada, setLocalizacaoBloqueada] = useState(false);


  // ---------- autocomplete fetch ----------
  const fetchLocalizacoes = async (query: string) => {
    if (!query) return setOptions([]);

    try {
      setLoadingOpt(true);
      const todas = await buscarLocalizacoes(); // usa a função da API que retorna nome e armazem

      const filtradas = todas.filter((loc) =>
        loc.nome.toLowerCase().includes(query.toLowerCase()) ||
        loc.armazem.toLowerCase().includes(query.toLowerCase())
      );

      setOptions(filtradas.map((loc) => ({
        id: loc.localizacao_id,
        nome: loc.nome,
        armazem: loc.armazem,
      })));

      // [{ id, nome, armazem, ... }]
    } catch (err) {
      console.error('Erro ao buscar localizações:', err);
      setOptions([]);
    } finally {
      setLoadingOpt(false);
    }
  };

  // ---------- Handlers ----------

  const handleAdicionarProduto = async () => {
    if (!produto || tipo === 'transferencia') return; // transferência não usa bipagem de produto

    const eanLimpo = produto.trim();
    setProduto('');

    try {
      const novo = await buscarProdutoPorEAN(eanLimpo);

      if (tipo === 'saida') {
        const encontrado = produtosOrigem.find(p => p.ean === eanLimpo);

        if (!encontrado) {
          alert(`Produto ${eanLimpo} não encontrado na localização de origem.`);
          return;
        }

        setLista((prevLista: Item[]) => {
          const novaLista: Item[] = [
            ...prevLista,
            {
              produto_id: encontrado.produto_id,
              sku: encontrado.sku,
              ean: encontrado.ean,
              descricao: encontrado.descricao,
              quantidade: 1,
              produto: encontrado.descricao,
              contador: '',
            },
          ];
          setSelectedItems((prev) => [...prev, novaLista.length - 1]);
          return novaLista;
        });
      }

      if (tipo === 'entrada') {
        setLista((prevLista: Item[]) => {
          const novaLista: Item[] = [
            ...prevLista,
            {
              produto_id: novo.produto_id,
              sku: novo.sku,
              ean: novo.ean,
              descricao: novo.descricao,
              quantidade: 1,
              produto: novo.descricao,
              contador: '',
            },
          ];
          setSelectedItems((prev) => [...prev, novaLista.length - 1]);
          return novaLista;
        });
      }
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      alert('Erro ao buscar produto.');
    }
  };


  const handleBuscarLocalizacao = async () => {
    if (!localizacao.trim()) return;

    const eanLocalizacao = localizacao.trim();
    const resultado = await buscarLocalizacaoPorEAN(eanLocalizacao);

    if (!resultado) {
      alert(`Localização com EAN ${eanLocalizacao} não encontrada.`);
      return;
    }

    setOrigem({ id: resultado.localizacao_id, nome: resultado.nome, armazem: resultado.armazem });
    setLocalizacao(''); // limpa o campo digitado
    setLocalizacaoBloqueada(true); // bloqueia o campo
  };

  const handleBuscarLocalizacaoEntrada = async () => {
    if (!localizacao.trim()) return;

    try {
      const resultado = await buscarLocalizacaoPorEAN(localizacao.trim());

      // ✅ Adicione esta verificação aqui:
      if (!resultado || !resultado.localizacao_id) {
        alert(`Localização com EAN ${localizacao.trim()} não encontrada.`);
        return;
      }

      const destinoFormatado: LocalizacaoOption = {
        id: resultado.localizacao_id,
        nome: resultado.nome,
        armazem: resultado.armazem || '',
      };

      setOrigem(destinoFormatado);
      setLocalizacao('');
      setLocalizacaoBloqueada(true);
    } catch (err) {
      console.error('Erro ao buscar localização (entrada):', err);
      alert('Erro ao buscar localização.');
    }
  };


  const handleBuscarLocalizacaoSaida = async () => {
    if (!localizacao.trim()) return;

    try {
      const resultado = await buscarLocalizacaoPorEAN(localizacao.trim());
      if (!resultado) {
        alert('Localização com esse EAN não foi encontrada.');
        return;
      }

      const origemFormatada: LocalizacaoOption = {
        id: resultado.localizacao_id,
        nome: resultado.nome,
        armazem: resultado.armazem || '',
      };

      setOrigem(origemFormatada);
      setLocalizacao('');
      setLocalizacaoBloqueada(true);

      const produtos = await buscarProdutosPorLocalizacaoDireto(origemFormatada.id);
      setProdutosOrigem(produtos); // armazenar produtos válidos da localização
      setLista([]); // inicia com lista vazia
      setSelectedItems([]); // inicia sem seleção
    } catch (err) {
      console.error('Erro ao buscar localização ou produtos (saída):', err);
      alert('Erro ao buscar localização e produtos.');
    }
  };


  const handleBuscarLocalizacaoTransferencia = async () => {
    if (!localizacao.trim()) return;

    try {
      const resultado = await buscarLocalizacaoPorEAN(localizacao.trim());
      if (!resultado) {
        alert('Localização com esse EAN não foi encontrada.');
        return;
      }

      const origemFormatada: LocalizacaoOption = {
        id: resultado.localizacao_id,
        nome: resultado.nome,
        armazem: resultado.armazem || '',
      };

      setOrigem(origemFormatada);
      setInputOrigem(`${origemFormatada.nome} - ${origemFormatada.armazem}`);
      setLocalizacao('');
      setLocalizacaoBloqueada(true);

      // Busca produtos da localização
      const produtos = await buscarProdutosPorLocalizacaoDireto(origemFormatada.id);
      console.table(produtos);

      // Corrigido: inclui produto_id também!
      const produtosValidos: Item[] = produtos
        .filter((item: Item) => item.produto_estoque_id && item.produto_id && Number(item.quantidade) > 0)
        .map((item: Item) => ({
          produto_estoque_id: item.produto_estoque_id,
          produto_id: item.produto_id, // 🔴 ESSENCIAL PARA TRANSFERÊNCIA
          descricao: item.descricao,
          sku: item.sku,
          ean: item.ean,
          quantidade: Number(item.quantidade),
        }));

      setLista(produtosValidos);
      setSelectedItems(produtosValidos.map((_, idx) => idx));

    } catch (err) {
      console.error('Erro ao buscar localização ou produtos (transferência):', err);
      alert('Erro ao buscar localização e produtos.');
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
    if (!validacaoCampos()) return;

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
      const usuario_id = 1;

      // Verificação básica
      if (tipo === 'transferencia') {

        for (const item of lista) {
          const estoqueAtual = await buscarProdutoEstoquePorId(item.produto_estoque_id!);
          if (!estoqueAtual || estoqueAtual.quantidade < item.quantidade!) {
            alert(`❌ Estoque insuficiente para ${item.descricao || item.ean}`);
            return;
          }
        }
        if (!origem?.id || !destino?.id) {
          alert('Transferência exige origem e destino.');
          return;
        }
        if (origem.id === destino.id) {
          alert('A origem e o destino não podem ser iguais.');
          return;
        }
      }

      if (lista.length === 0) {
        alert('Nenhum produto para movimentar.');
        return;
      }

      // Validação dos itens
      let itensValidos: any[] = [];

      if (tipo === 'entrada' || tipo === 'saida') {
        itensValidos = lista
          .filter(item => item.produto_id && Number(item.quantidade) > 0)
          .map(item => ({
            produto_id: Number(item.produto_id),
            quantidade: Number(item.quantidade),
          }));
      }

      if (tipo === 'transferencia') {
        itensValidos = lista
          .filter(item => item.produto_id && item.produto_estoque_id && Number(item.quantidade) > 0)
          .map(item => ({
            produto_id: Number(item.produto_id),
            produto_estoque_id: Number(item.produto_estoque_id),
            quantidade: Number(item.quantidade),
          }));
      }

      if (itensValidos.length === 0) {
        alert('Nenhum item válido para movimentar.');
        return;
      }

      const payload: any = {
        tipo,
        usuario_id: usuario_id,
        itens_movimentacao: itensValidos,
        localizacao_origem_id: tipo === 'entrada' ? 0 : origem?.id ?? null,
        localizacao_destino_id:
          tipo === 'saida' ? 0 :
            tipo === 'transferencia' ? destino?.id ?? null :
              origem?.id ?? null,
      };

      console.log('📦 Payload final:', payload);
      await enviarMovimentacao(payload);
      alert('Movimentação realizada com sucesso!');

      // Resetar estado
      setConfirmOpen(false);
      setLista([]);
      setOrigem(null);
      setDestino(null);
      setLocalizacao('');
      setLocalizacaoBloqueada(false);
    } catch (err: any) {
      console.error('Erro ao enviar movimentacao:', err);
      if (err.response) {
        console.error('📛 Código:', err.response.status);
        console.dir(err.response.data);
      }
      alert(err?.response?.data?.message || 'Falha ao salvar movimentação.');
    }
  };

  const validacaoCampos = () => {
    if (lista.length === 0) {
      alert('Adicione pelo menos um produto.');
      return false;
    }
    if (tipo === 'saida' && !origem?.id) {
      alert('Saída exige localização de origem.');
      return false;
    }
    if (tipo === 'entrada' && !origem?.id && !localizacao) {
      alert('Entrada exige localização de destino.');
      return false;
    }
    if (tipo === 'transferencia' && (!origem?.id || !destino?.id)) {
      alert('Transferência exige origem e destino.');
      return false;
    }
    return true;
  };



  // ---------- UI ----------
  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
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
            <>
              <Box display="flex" flexDirection="column" gap={2}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={options}
                  getOptionLabel={(opt) => `${opt.nome} - ${opt.armazem}`}
                  value={origem}
                  inputValue={inputOrigem}
                  loading={loadingOpt}
                  onInputChange={async (_, val) => {
                    setInputOrigem(val);
                    setOrigem(null);
                    if (val.length >= 13 && /^[0-9]{13}$/.test(val)) {
                      // Validação para detectar EAN com 13 dígitos
                      try {
                        const resultado = await buscarLocalizacaoPorEAN(val.trim());

                        if (!resultado) {
                          alert('Localização com esse EAN não foi encontrada.');
                          return;
                        }

                        const origemFormatada: LocalizacaoOption = {
                          id: resultado.localizacao_id,
                          nome: resultado.nome,
                          armazem: resultado.armazem?.nome || resultado.armazem, // se for string
                        };

                        setOrigem(origemFormatada);
                        setInputOrigem(`${origemFormatada.nome} - ${origemFormatada.armazem}`);

                        const produtos = await buscarProdutosPorLocalizacaoDireto(origemFormatada.id);
                        setLista(produtos);
                        setSelectedItems(produtos.map((_: any, idx: number) => idx));
                      } catch (err) {
                        console.error('Erro ao buscar localização ou produtos:', err);
                        alert('Erro ao buscar localização e produtos.');
                      }
                    } else {
                      // Busca autocomplete comum
                      if (val.length >= 1) fetchLocalizacoes(val);
                      else setOptions([]);
                    }
                  }}
                  onChange={async (_, val) => {
                    setOrigem(val);
                    if (val) {
                      setInputOrigem(`${val.nome} - ${val.armazem}`);
                      try {
                        const produtos = await buscarProdutosPorLocalizacaoDireto(val.id);
                        setLista(produtos);
                        setSelectedItems(produtos.map((_: any, idx: number) => idx));
                      } catch (err) {
                        alert('Erro ao buscar produtos da localização de origem.');
                      }
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Localização Origem"
                      sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingOpt ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  ListboxProps={{
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  }}
                />

                <Autocomplete
                  fullWidth
                  size="small"
                  options={options}
                  getOptionLabel={(opt) => `${opt.nome} - ${opt.armazem}`}
                  value={destino}
                  inputValue={inputDestino}
                  loading={loadingOpt}
                  onInputChange={async (_, val) => {
                    setInputDestino(val);
                    setDestino(null);

                    if (val.length >= 13 && /^[0-9]{13}$/.test(val)) {
                      // Validação para EAN de 13 dígitos
                      try {
                        const resultado = await buscarLocalizacaoPorEAN(val.trim());

                        if (!resultado) {
                          alert('Localização com esse EAN não foi encontrada.');
                          return;
                        }

                        const destinoFormatado: LocalizacaoOption = {
                          id: resultado.localizacao_id,
                          nome: resultado.nome,
                          armazem: resultado.armazem?.nome || resultado.armazem,
                        };

                        setDestino(destinoFormatado);
                        setInputDestino(`${destinoFormatado.nome} - ${destinoFormatado.armazem}`);
                      } catch (err) {
                        console.error('Erro ao buscar localização destino por EAN:', err);
                        alert('Erro ao buscar localização destino.');
                      }
                    } else {
                      if (val.length >= 1) fetchLocalizacoes(val);
                      else setOptions([]);
                    }
                  }}
                  onChange={(_, val) => {
                    setDestino(val);
                    if (val) {
                      setInputDestino(`${val.nome} - ${val.armazem}`);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Localização Destino"
                      sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingOpt ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  ListboxProps={{
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  }}
                />

              </Box>

              {/* Exibe campos bloqueados após preenchimento */}
              {origem && destino && (
                <Box display="flex" gap={2} mt={2}>
                  {/* Origem */}
                  <Box
                    flex={1}
                    sx={{
                      backgroundColor: '#e9f8e5',
                      border: '2px solid #4caf50',
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography fontWeight={600} fontSize={13} color="#2e7d32" mb={0.5}>
                      Localização Origem
                    </Typography>
                    <Typography fontWeight={500} fontSize={15} color="#000">
                      {origem.nome} <span style={{ color: '#555' }}>– {origem.armazem}</span>
                    </Typography>
                  </Box>

                  {/* Destino */}
                  <Box
                    flex={1}
                    sx={{
                      backgroundColor: '#e4f0fc',
                      border: '2px solid #2196f3',
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography fontWeight={600} fontSize={13} color="#1565c0" mb={0.5}>
                      Localização Destino
                    </Typography>
                    <Typography fontWeight={500} fontSize={15} color="#000">
                      {destino.nome} <span style={{ color: '#555' }}>– {destino.armazem}</span>
                    </Typography>
                  </Box>
                </Box>
              )}

            </>
          )}

          {tipo !== 'transferencia' && (
            <>
              <TextField
                fullWidth
                label="Bipe a Localização"
                size="small"
                value={localizacaoBloqueada ? origem?.nome || '' : localizacao}
                onChange={(e) => !localizacaoBloqueada && setLocalizacao(e.target.value)}
                onKeyDown={(e) => {
                  if (!localizacaoBloqueada && e.key === 'Enter') {
                    if (tipo === 'entrada') handleBuscarLocalizacaoEntrada();
                    else if (tipo === 'saida') handleBuscarLocalizacaoSaida();
                    else if (tipo === 'transferencia') handleBuscarLocalizacaoTransferencia();
                  }
                }}
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

        <Paper
          elevation={1}
          sx={{
            mb: 5,
            borderRadius: 2,
            maxHeight: '330px', // altura ajustável conforme seu layout
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>

                {tipo === 'transferencia' ? (
                  <>
                    <TableCell><strong>Quantidade</strong></TableCell>
                    <TableCell><strong>Produto</strong></TableCell>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell><strong>EAN</strong></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectAll}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < lista.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell><strong>Contador</strong></TableCell>
                    <TableCell><strong>Descrição</strong></TableCell>
                    <TableCell><strong>SKU</strong></TableCell>
                    <TableCell><strong>EAN</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {lista.map((item, index) => {
                const isSelected = selectedItems.includes(index);
                return (
                  <TableRow key={`${item.ean}-${index}`} hover selected={isSelected}>

                    {tipo === 'transferencia' ? (
                      <>
                        <TableCell>{item.quantidade ?? 1}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.ean}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectItem(index, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.ean}</TableCell>
                      </>
                    )}

                    {tipo !== 'transferencia' && (
                      <TableCell align="center">
                        {/* <Tooltip title="Editar">
                          <IconButton onClick={() => handleEditar(item)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip> */}
                        <Tooltip title="Excluir">
                          <IconButton onClick={() => handleExcluir(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        {/* Botões */}
        <Box display="flex" justifyContent="center" gap={4} mt={6} mb={4}>
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