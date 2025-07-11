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

interface Item {
  contador?: string;
  descricao?: string;
  sku: string;
  ean: string;
  quantidade?: number;
  produto?: string;
}

interface LocalizacaoOption {
  id: number;
  nome: string;
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

  // Produtos / lista
  const [produto, setProduto] = useState('');
  const [lista, setLista] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  // ---------- autocomplete fetch ----------
  const fetchLocalizacoes = async (query: string) => {
    if (!query) return setOptions([]);
    try {
      setLoadingOpt(true);
      const resp = await fetch(`/api/localizacoes?query=${encodeURIComponent(query)}`);
      const data = await resp.json();
      setOptions(data); // espere array [{id,nome}]
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpt(false);
    }
  };

  // ---------- Handlers ----------
  const handleAdicionarProduto = () => {
    if (!produto) return;
    const novoItem: Item =
      tipo === 'transferencia'
        ? { quantidade: 1, produto, sku: '100542', ean: produto }
        : { contador: 'Cell A', descricao: 'Cell B', sku: 'Cell C', ean: produto };

    setLista((prev) => [...prev, novoItem]);
    setProduto('');
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
  const montarPayload = () => {
  const usuarioId = 1; // ID do usuário logado

  const tipoMovimentacao = tipo.toUpperCase(); // 'entrada' => 'ENTRADA'

  const payload: any = {
    tipo: tipoMovimentacao,
    usuario_id: usuarioId,
    itens_movimentacao: lista.map((item) => ({
      produto_id: parseInt(item.sku), // ou use outro campo como produto_id se tiver
      quantidade: item.quantidade ?? 1
    }))
  };

  if (tipo === 'entrada') {
    payload.localizacao_origem_id = origem?.id || parseInt(localizacao); // ou localizacao
  } else if (tipo === 'saida') {
    payload.localizacao_destino_id = destino?.id || parseInt(localizacao);
  } else if (tipo === 'transferencia') {
    payload.localizacao_origem_id = origem?.id;
    payload.localizacao_destino_id = destino?.id;
  }

  return payload;
};

  const handleConfirmarOperacao = async () => {
  try {
    const payload = montarPayload();
    
    const response = await fetch('/api/movimentacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar movimentação');
    }

    // Sucesso
    alert('Movimentação realizada com sucesso!');
    setConfirmOpen(false);
    setLista([]);
    setOrigem(null);
    setDestino(null);
    setLocalizacao('');
  } catch (err) {
    console.error(err);
    alert('Falha ao salvar a movimentação.');
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
            <>
              <Box display="flex" flexDirection="column" gap={2}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={options}
                  getOptionLabel={(opt) => opt.nome}
                  value={origem}
                  loading={loadingOpt}
                  onInputChange={(_, val) => fetchLocalizacoes(val)}
                  onChange={(_, val) => setOrigem(val)}
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
                />

                <Autocomplete
                  fullWidth
                  size="small"
                  options={options}
                  getOptionLabel={(opt) => opt.nome}
                  value={destino}
                  loading={loadingOpt}
                  onInputChange={(_, val) => fetchLocalizacoes(val)}
                  onChange={(_, val) => setDestino(val)}
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
                />
              </Box>

              {/* Exibe campos bloqueados após preenchimento */}
              {origem && destino && (
                <Box display="flex" gap={2} mt={2}>
                  <Box
                    flex={1}
                    sx={{
                      backgroundColor: '#d8d8d8',
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      borderRadius: 1,
                      fontWeight: 500,
                    }}
                  >
                    {origem.nome}
                  </Box>
                  <Box
                    flex={1}
                    sx={{
                      backgroundColor: '#d8d8d8',
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      borderRadius: 1,
                      fontWeight: 500,
                    }}
                  >
                    {destino.nome}
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
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
              />
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
                  <TableRow key={index} hover selected={isSelected}>
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