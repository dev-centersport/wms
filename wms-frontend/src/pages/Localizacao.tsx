import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {

  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
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
  Tooltip,
  TableSortLabel

} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import Layout from '../components/Layout';
import { excluirLocalizacao, buscarLocalizacoes, buscarConsultaEstoque } from '../services/API';
import ProdutosLocalizacaoModal from '../components/ProdutosLocalizacaoModal';
import { BotaoComPermissao } from '../components/BotaoComPermissao';
import { usePermissao } from '../contexts/PermissaoContext';


const normalizar = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

type LocalizacaoComQtd = {

  localizacao_id: number;
  nome: string;
  tipo: string;
  tipo_localizacao_id: number;
  armazem: string;
  armazem_id: number;
  ean: string;
  total_produtos: number;
};

const Localizacao: React.FC = () => {
  const { temPermissao } = usePermissao();
  const [listaLocalizacoes, setListaLocalizacoes] = useState<LocalizacaoComQtd[]>([]);
  const [busca, setBusca] = useState('');
  const [inputBusca, setInputBusca] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [modalOpen, setModalOpen] = useState(false);
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState<{ id: number; nome: string } | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroArmazem, setFiltroArmazem] = useState('');
  const [appliedFiltroTipo, setAppliedFiltroTipo] = useState('');
  const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [orderBy, setOrderBy] = useState<keyof LocalizacaoComQtd>('nome');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

  const navigate = useNavigate();

  // Localizações selecionadas do tipo 'caixa'
  const selectedCaixas = useMemo(() => {
    return selectedItems
      .map((idx) => listaLocalizacoes[idx])
      .filter((loc) => loc.tipo.toLowerCase().includes('caixa'));
  }, [selectedItems, listaLocalizacoes]);

  // Localizações selecionadas do tipo 'prateleira'
  const selectedPrateleiras = useMemo(() => {
    return selectedItems
      .map((idx) => listaLocalizacoes[idx])
      .filter((loc) => loc.tipo.toLowerCase().includes('prateleira'));
  }, [selectedItems, listaLocalizacoes]);

  // Filtros ativos (útil para estilizar botões, chips, etc)
  const filtrosAtivos = useMemo(() => {
    return {
      tipo: appliedFiltroTipo !== '',
      armazem: appliedFiltroArmazem !== '',
      algum: appliedFiltroTipo !== '' || appliedFiltroArmazem !== ''
    };
  }, [appliedFiltroTipo, appliedFiltroArmazem]);

  const gerarMapaEstoque = (estoque: any[]): Record<number, number> => {
    const mapa: Record<number, number> = {};
    estoque.forEach(({ localizacao_id, quantidade }) => {
      if (localizacao_id) {
        mapa[localizacao_id] = (mapa[localizacao_id] || 0) + (quantidade || 0);
      }
    });
    return mapa;
  };

  const carregarTodasLocalizacoes = async (): Promise<any[]> => {
    const todasLocalizacoes: any[] = [];
    const limite = 10000;
    let offset = 0;
    let total = Infinity;

    while (todasLocalizacoes.length < total) {
      const res = await buscarLocalizacoes(limite, offset);
      todasLocalizacoes.push(...res.results);
      total = res.total;
      offset += limite;
    }

    return todasLocalizacoes;
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const localizacoes = await carregarTodasLocalizacoes();
        const estoque = await buscarConsultaEstoque();
        const mapa = gerarMapaEstoque(estoque);

        const locsComQtd: LocalizacaoComQtd[] = localizacoes.map((l: any) => ({
          ...l,
          total_produtos: mapa[l.localizacao_id] || 0,
        }));

        setListaLocalizacoes(locsComQtd);
      } catch (err) {
        console.error('Erro ao carregar localizações →', err);
      }
    };

    carregar();
  }, []);


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroTipo(filtroTipo);
    setAppliedFiltroArmazem(filtroArmazem);
    setCurrentPage(1);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroTipo('');
    setFiltroArmazem('');
    setAppliedFiltroTipo('');
    setAppliedFiltroArmazem('');
    setCurrentPage(1);
    handleMenuClose();
  };

  const filteredIndices = useMemo(() => {
    const termo = normalizar(busca);

    return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
      const campos = [loc.nome, loc.tipo, loc.armazem, loc.ean]
        .filter(Boolean)
        .map((c) => normalizar(c));

      const matchBusca = termo === '' || campos.some((c) => c.includes(termo));
      const matchTipo = !appliedFiltroTipo || normalizar(loc.tipo).includes(normalizar(appliedFiltroTipo));
      const matchArmazem = !appliedFiltroArmazem || normalizar(loc.armazem).includes(normalizar(appliedFiltroArmazem));

      if (matchBusca && matchTipo && matchArmazem) acc.push(idx);
      return acc;
    }, []);
  }, [listaLocalizacoes, busca, appliedFiltroTipo, appliedFiltroArmazem]);

  const handleSort = (property: keyof LocalizacaoComQtd) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentIndices = filteredIndices.slice(startIndex, endIndex); // recupera os índices
  const currentItems = useMemo(() => {
    const lista = currentIndices.map((i) => listaLocalizacoes[i]);
    return [...lista].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
      const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

      if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [currentIndices, listaLocalizacoes, orderBy, orderDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busca, appliedFiltroTipo, appliedFiltroArmazem]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    const allSelected = currentIndices.length > 0 && currentIndices.every(idx => selectedItems.includes(idx));
    setSelectAll(allSelected);
  }, [selectedItems, currentIndices]);

  /* --------------------------- seleção tabela -------------------------- */
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentIndices : []);
  };

  const handleSelectItem = (originalIndex: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
    );
  };

  // Função para abrir o modal de produtos
  const handleVerProdutos = (id: number, nome: string) => {
    setLocalizacaoSelecionada({ id, nome });
    setModalOpen(true);
  };

  // Função para atualizar a quantidade total após visualização
  const handleQuantidadeAtualizada = async () => {
    // Recarregar os dados da tabela para atualizar as quantidades
    const carregar = async () => {
      try {
        const [locs, estoque] = await Promise.all([
          buscarLocalizacoes(),
          buscarConsultaEstoque(),
        ]);

        // soma por localizacao_id
        const mapa: Record<number, number> = {};
        estoque.forEach((item: any) => {
          const id = item.localizacao_id;
          if (!id) return;
          mapa[id] = (mapa[id] || 0) + (item.quantidade || 0);
        });

        const locsComQtd: LocalizacaoComQtd[] = locs.results.map((l: any) => ({

          ...l,
          total_produtos: mapa[l.localizacao_id] || 0,
        }));

        setListaLocalizacoes(locsComQtd);
      } catch (err) {
        console.error('Erro ao carregar localizações →', err);
      }
    };

    carregar();
  };

  const processarNomePrateleira = (nome: string): string => {
    console.log('=== INÍCIO PROCESSAMENTO PRATELEIRA ===');
    console.log('Nome original:', nome);

    if (!nome || typeof nome !== 'string') {
      console.log('Nome inválido, retornando nome original');
      return nome;
    }

    let nomeProcessado = nome.trim();
    console.log('Nome após trim:', nomeProcessado);

    // Remove prefixo CEN- se existir (case insensitive)
    if (nomeProcessado.toUpperCase().startsWith('CEN-')) {
      nomeProcessado = nomeProcessado.substring(4); // Remove "CEN-"
      console.log('Após remoção CEN-:', nomeProcessado);
    }

    // Se tem #, remove tudo até # (lógica anterior)
    const indexHash = nomeProcessado.indexOf('#');
    if (indexHash !== -1) {
      nomeProcessado = nomeProcessado.substring(indexHash + 1);
      console.log('Após remoção até #:', nomeProcessado);
    } else {
      // Se não tem #, aplica a lógica usando - como delimitador
      console.log('Não encontrou #, aplicando lógica com - como delimitador');
      
      // Se já removeu CEN-, então o nome já está correto
      // Se não removeu CEN-, então divide pelo primeiro - e pega a parte após
      if (!nome.toUpperCase().startsWith('CEN-')) {
        const partes = nomeProcessado.split('-');
        if (partes.length > 1) {
          nomeProcessado = partes.slice(1).join('-'); // Pega tudo após o primeiro -
          console.log('Após divisão por -:', nomeProcessado);
        }
      }
    }

    // Converte AAA para AA (lógica anterior)
    if (nomeProcessado.toUpperCase().startsWith('AAA')) {
      nomeProcessado = 'AA' + nomeProcessado.substring(3);
      console.log('Após conversão AAA->AA:', nomeProcessado);
    }

    // Converte 3 ou mais letras iguais para 2 (lógica anterior)
    const match = nomeProcessado.match(/^([A-Z])\1{2,}/i);
    if (match) {
      const letra = match[1];
      const resto = nomeProcessado.substring(match[0].length);
      nomeProcessado = letra + letra + resto;
      console.log('Após conversão letras repetidas:', nomeProcessado);
    }

    console.log('Nome final processado:', nomeProcessado);
    console.log('=== FIM PROCESSAMENTO PRATELEIRA ===');

    return nomeProcessado;
  };

  const handleImprimir = (localizacao: string, ean: string, tipo: string, armazem: string) => {
  const tipoLower = tipo.toLowerCase();

  if (tipoLower.includes('cesto')) {
    handleImprimirCesto(localizacao, ean); // CORRETO
    return;
  }

  if (tipoLower.includes('caixa')) {
    handleImprimirCaixa(localizacao, ean, armazem);
    return;
  }

  const w = window.open('', '_blank');
  if (!w) return;

  const isCaixa = tipoLower.includes('caixa');
  const isPrateleira = tipoLower.includes('prateleira');

  const largura = isCaixa || isPrateleira ? '10cm' : '5cm';
  const altura = isCaixa ? '15cm' : isPrateleira ? '5cm' : '10cm';

  const fontNome = '120px';
  const barHeight = isCaixa ? 90 : 20;
  const barFont = isCaixa ? 22 : 10;

  const nomeImpresso = isPrateleira
    ? processarNomePrateleira(localizacao)
    : localizacao;

  const bodyJustify = isPrateleira ? 'flex-start' : 'center';
  const nomeMarginTop = isPrateleira ? '-3mm' : '0';

  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Etiqueta – ${localizacao}</title>
      <style>
        @page {
          size: ${largura} ${altura};
          margin: 0;
        }
        body {
          width: ${largura};
          height: ${altura};
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: ${bodyJustify};
          font-family: Arial, sans-serif;
          overflow: hidden;
        }
        #nome {
          font-weight: bold;
          font-size: ${fontNome};
          margin: ${nomeMarginTop} 0 0 0;
          padding: 0;
          line-height: 1;
          width: 100%;
          text-align: center;
          word-break: break-word;
        }
        #barcode {
          width: 90%;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div id="nome">${nomeImpresso}</div>
      <svg id="barcode"></svg>

      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        window.onload = () => {
          console.log('=== INÍCIO GERAÇÃO DE ETIQUETA ===');
          
          const nomeEl = document.getElementById('nome');
          const texto = '${nomeImpresso}';
          let tamanho = ${fontNome.replace('px', '')};

          if (texto.length > 8)      tamanho = 50;
          else if (texto.length > 5) tamanho = 180;

          nomeEl.style.fontSize = tamanho + 'px';
          console.log('Tamanho da fonte ajustado para:', tamanho + 'px');

          console.log('Generating barcode for EAN:', '${ean}');
          console.log('Barcode element:', document.getElementById('barcode'));
          
          if (!'${ean}' || '${ean}'.trim() === '') {
            console.error('EAN vazio ou inválido:', '${ean}');
            alert('EAN vazio ou inválido: ' + '${ean}');
            return;
          }
          
          try {
            const barcodeElement = document.getElementById('barcode');
            if (!barcodeElement) {
              console.error('Elemento barcode não encontrado');
              alert('Elemento barcode não encontrado');
              return;
            }
            
            console.log('Tentando gerar barcode...');
            JsBarcode('#barcode', '${ean}', {
              format: 'ean13',
              height: ${barHeight},
              displayValue: true,
              fontSize: ${barFont}
            });
            console.log('Barcode generated successfully for EAN:', '${ean}');
            
            // Aguarda um pouco para garantir que o barcode foi renderizado
            setTimeout(() => {
              console.log('Iniciando impressão...');
              window.print();
              window.onafterprint = () => {
                console.log('Fechando janela após impressão...');
                window.close();
              };
            }, 500);
            
          } catch (error) {
            console.error('Error generating barcode for EAN:', '${ean}', error);
            console.error('Error details:', error.message, error.stack);
            alert('Erro ao gerar código de barras: ' + error.message);
          }
        };
      </script>
    </body>
    </html>
  `);

  w.document.close();
};

  const handleImprimirCesto = (nome: string, ean: string) => {
  const largura = '10cm';
  const altura = '3cm';
  const barHeight = 55;
  const barFont = 16;

  const nomeEscapado = nome.replace(/'/g, "\\'");
  const eanEscapado = ean.replace(/'/g, "\\'");

  const w = window.open('', '_blank');
  if (!w) return;

  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Etiqueta – Cesto</title>
      <style>
        @page {
          size: ${largura} ${altura};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .etiqueta {
          width: ${largura};
          height: ${altura};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
        }
        .conteudo {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 90%;
        }
        .nome {
          font-weight: bold;
          font-size: 50px;
          margin: 0;
          padding: 0;
          line-height: 1;
          white-space: nowrap;
        }
        .barcode {
          width: 120px;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="etiqueta" data-ean="${eanEscapado}">
        <div class="conteudo">
          <div class="nome" id="nome-0">${nomeEscapado}</div>
          <svg class="barcode" id="barcode-0"></svg>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        const nome = '${nomeEscapado}';
        const svg = document.getElementById('barcode-0');
        const nomeEl = document.getElementById('nome-0');
        let tamanho = 50;
        if (nome.length > 10)      tamanho = 20;
        else if (nome.length > 6)  tamanho = 35;
        nomeEl.style.fontSize = tamanho + 'px';

        JsBarcode(svg, '${eanEscapado}', {
          format: 'ean13',
          height: ${barHeight},
          displayValue: true,
          fontSize: ${barFont}
        });

        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      </script>
    </body>
    </html>
  `);

  w.document.close();
};

  const handleImprimirSelecionadosCesto = () => {
  let indicesParaImprimir = selectedItems;

  if (!indicesParaImprimir.length) {
    indicesParaImprimir = listaLocalizacoes
      .map((loc, idx) => (loc.tipo.toLowerCase().includes('cesto') ? idx : -1))
      .filter((idx) => idx !== -1);

    setSelectedItems(indicesParaImprimir);
    setSelectAll(false);
  }

  if (!indicesParaImprimir.length) {
    alert('Nenhuma localização do tipo "Cesto" encontrada.');
    return;
  }

  const largura = '10cm';
  const altura = '3cm';
  const fontNome = '70px';
  const barHeight = 55;   // AUMENTADO
  const barFont = 16;     // AUMENTADO

  const w = window.open('', '_blank');
  if (!w) return;

  // Cabeçalho e estilo
  w.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Etiquetas – Cestos</title>
      <style>
        @page {
          size: ${largura} ${altura};
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .etiqueta {
          width: ${largura};
          height: ${altura};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          page-break-after: always;
        }
        .conteudo {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 90%;
        }
        .nome {
          font-weight: bold;
          font-size: ${fontNome};
          margin: 0;
          padding: 0;
          line-height: 1;
          white-space: nowrap;
        }
        .barcode {
          width: 120px;  /* AJUSTADO PARA FICAR GRANDE, MAS DENTRO DA ETIQUETA */
          height: 100%;
        }
      </style>
    </head>
    <body>
  `);

  // Conteúdo da etiqueta
  indicesParaImprimir.forEach((idx, i) => {
    const item = listaLocalizacoes[idx];
    const nomeEscapado = item.nome.replace(/'/g, "\\'");
    const eanEscapado = item.ean.replace(/'/g, "\\'");
    w.document.write(`
      <div class="etiqueta" data-ean="${eanEscapado}">
        <div class="conteudo">
          <div class="nome" id="nome-${i}">${nomeEscapado}</div>
          <svg class="barcode" id="barcode-${i}"></svg>
        </div>
      </div>
    `);
  });

  // Script de geração do código de barras
  w.document.write(`
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script>
      window.onload = () => {
        document.querySelectorAll('.etiqueta').forEach((div, index) => {
          const nome = div.querySelector('.nome').innerText;
          const svg = div.querySelector('.barcode');
          const ean = div.dataset.ean;

          let tamanho = 50;
          if (nome.length > 10)      tamanho = 20;
          else if (nome.length > 6)  tamanho = 35;

          document.getElementById('nome-' + index).style.fontSize = tamanho + 'px';

          JsBarcode(svg, ean, {
            format: 'ean13',
            height: ${barHeight},
            displayValue: true,
            fontSize: ${barFont}
          });
        });

        window.print();
        window.onafterprint = () => window.close();
      };
    </script>
    </body>
    </html>
  `);

  w.document.close();
};



  const handleImprimirCaixa = (localizacao: string, ean: string, armazem: string) => {
    const w = window.open('', '_blank');
    if (!w) return;

    const largura = '10cm';
    const altura = '15cm';
    const fontNome = '120px';
    const barHeight = 90;
    const barFont = 22;
    const armazemEscapado = armazem.replace(/'/g, "\\'");
    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiqueta – ${localizacao}</title>
          <style>
            @page {
              size: ${largura} ${altura};
              margin: 0;
            }
            body {
              width: ${largura};
              height: ${altura};
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              overflow: hidden;
            }
            .container {
              transform: rotate(-90deg);
              margin-top: 100px;
              transform-origin: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
            }
            #nome {
              font-weight: bold;
              font-size: ${fontNome};
              margin: 0;
              padding: 0;
              text-align: center;
              white-space: nowrap;
            }
              
            #barcode {
              width: 90%;
              margin: 0;
              padding: 0;
            }
            #nomeArmazem {
              font-size: 30px;
              margin: 0;
              padding: 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div id="nome">${localizacao}</div>
            <div id="nomeArmazem">${armazemEscapado}</div>
            <svg id="barcode"></svg>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            const nomeEl = document.getElementById('nome');
            const texto = '${localizacao}';
            let tamanho = ${fontNome.replace('px', '')};

            if (texto.length > 8)      tamanho = 50;
            else if (texto.length > 5) tamanho = 180;

            nomeEl.style.fontSize = tamanho + 'px';

            JsBarcode('#barcode', '${ean}', {
              format: 'ean13',
              height: ${barHeight},
              displayValue: true,
              fontSize: ${barFont}
            });

            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
        </html>
      `);


    w.document.close();
  };

  /* ------------------------------------------------------------------ */
  /* Substitua a função handleImprimirSelecionados pelo código abaixo   */
  /* ------------------------------------------------------------------ */
 const handleImprimirSelecionados = () => {
  let indicesParaImprimir = selectedItems;

  if (!indicesParaImprimir.length) {
    indicesParaImprimir = listaLocalizacoes
      .map((loc, idx) => {
        const tipo = loc.tipo?.toLowerCase() || '';
        if (tipo.includes('caixa') || tipo.includes('prateleira') || tipo.includes('cesto')) return idx;
        return -1;
      })
      .filter((idx) => idx !== -1);

    setSelectedItems(indicesParaImprimir);
    setSelectAll(false);
  }

  if (!indicesParaImprimir.length) {
    alert('Nenhuma localização do tipo "Caixa", "Prateleira" ou "Cesto" encontrada.');
    return;
  }

  const tiposSelecionados = indicesParaImprimir.map(
    (idx) => listaLocalizacoes[idx].tipo.toLowerCase()
  );

  const tipoUnico = tiposSelecionados.every((t) => t === tiposSelecionados[0]);
  if (!tipoUnico) {
    alert('Imprima apenas etiquetas de um mesmo tipo por vez (todas CAIXA, PRATELEIRA ou CESTO).');
    return;
  }

  const armazemSelecionados = indicesParaImprimir.map(
    (idx) => listaLocalizacoes[idx].armazem.toLowerCase()
  );

  const armazemUnico = armazemSelecionados.every((t) => t === armazemSelecionados[0]);
  if (!armazemUnico) {
    alert('Imprima apenas etiquetas de um mesmo armazém.');
    return;
  }

  const tipoAtual = tiposSelecionados[0];

  if (tipoAtual.includes('caixa')) {
    handleImprimirSelecionadosCaixa();
  } else if (tipoAtual.includes('prateleira')) {
    handleImprimirSelecionadosPrateleira();
  } else if (tipoAtual.includes('cesto')) {
    handleImprimirSelecionadosCesto();
  } else {
    alert('Tipo de localização não suportado para impressão.');
  }
};


  const handleImprimirSelecionadosCaixa = () => {
    let indicesParaImprimir = selectedItems;
    if (!indicesParaImprimir.length) {
      indicesParaImprimir = listaLocalizacoes
        .map((loc, idx) => (loc.tipo.toLowerCase().includes('caixa') ? idx : -1))
        .filter((idx) => idx !== -1);

      setSelectedItems(indicesParaImprimir);
      setSelectAll(false);
    }

    if (!indicesParaImprimir.length) {
      alert('Nenhuma localização do tipo "Caixa" encontrada.');
      return;
    }

    const w = window.open('', '_blank');
    if (!w) return;

    const largura = '10cm';
    const altura = '15cm';
    const fontNome = '120px';
    const barHeight = 90;
    const barFont = 22;

    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiquetas – Caixas</title>
          <style>
            @page {
              size: ${largura} ${altura};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .etiqueta {
              width: ${largura};
              height: ${altura};
              position: relative;
              page-break-after: always;
            }
            .container {
              transform: rotate(-90deg);
              transform-origin: left top;
              position: absolute;
              top: ${altura};
              left: 0;
              width: ${altura};
              height: ${largura};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            .nome {
              font-weight: bold;
              font-size: ${fontNome};
              margin: 0;
              padding: 0;
              text-align: center;
              white-space: nowrap;
            }
            .barcode {
              width: 90%;
              margin: 0;
              padding: 0;
            }
            .nomeArmazem {
              font-size: 30px;
              margin: 0;
              padding: 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
      `);


    indicesParaImprimir.forEach((idx, i) => {
      const item = listaLocalizacoes[idx];
      const nomeEscapado = item.nome.replace(/'/g, "\\'");
      const eanEscapado = item.ean.replace(/'/g, "\\'");
      const armazemEscapado = item.armazem.replace(/'/g, "\\'");
      w.document.write(`

          <div class="etiqueta" data-ean="${eanEscapado}">
            <div class="container">
              <div class="nome" id="nome-${i}">${nomeEscapado}</div>
              <div class="nomeArmazem">${armazemEscapado}</div>
              <svg class="barcode" id="barcode-${i}"></svg>

            </div>
          </div>
        `);
    });

    w.document.write(`
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = () => {
            document.querySelectorAll('.etiqueta').forEach((div, index) => {
              const nome = div.querySelector('.nome').innerText;
              const svg = div.querySelector('.barcode');
              const ean = div.dataset.ean;

              let tamanho = ${fontNome.replace('px', '')};
              if (nome.length > 8)      tamanho = 50;
              else if (nome.length > 5) tamanho = 140;

              document.getElementById('nome-' + index).style.fontSize = tamanho + 'px';

              JsBarcode(svg, ean, {
                format: 'ean13',
                height: ${barHeight},
                displayValue: true,
                fontSize: ${barFont}
              });
            });

            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
        </body>
        </html>
      `);


    w.document.close();
  };

  const handleImprimirSelecionadosPrateleira = () => {
    let indicesParaImprimir = selectedItems;
    if (!indicesParaImprimir.length) {
      indicesParaImprimir = listaLocalizacoes
        .map((loc, idx) => (loc.tipo.toLowerCase().includes('prateleira') ? idx : -1))
        .filter((idx) => idx !== -1);


      setSelectedItems(indicesParaImprimir);
      setSelectAll(false);
    }

    if (!indicesParaImprimir.length) {
      alert('Nenhuma localização do tipo "Prateleira" encontrada.');
      return;
    }

    const tiposSelecionados = indicesParaImprimir.map(
      (idx) => listaLocalizacoes[idx].tipo.toLowerCase()
    );
    const tipoUnico = tiposSelecionados.every((t) => t === tiposSelecionados[0]);
    if (!tipoUnico) {
      alert('Imprima apenas etiquetas de um mesmo tipo por vez (todas CAIXA ou todas PRATELEIRA).');
      return;
    }

    const tipoAtual = tiposSelecionados[0];
    const isCaixa = tipoAtual.includes('caixa');
    const isPrateleira = tipoAtual.includes('prateleira');

    const largura = isCaixa || isPrateleira ? '10cm' : '5cm';
    const altura = isCaixa ? '15cm' : isPrateleira ? '5cm' : '10cm';
    const fontNome = '120px';
    const barHeight = isCaixa ? 90 : 20;
    const barFont = isCaixa ? 22 : 10;
    const bodyJustify = isPrateleira ? 'flex-start' : 'center';
    const nomeMarginTop = isPrateleira ? '-3mm' : '0';

    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiquetas</title>
          <style>
            @page {
              size: ${largura} ${altura};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .etiqueta {
              width: ${largura};
              height: ${altura};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: ${bodyJustify};
              font-family: Arial, sans-serif;
              page-break-after: always;
            }
            .nome {
              font-weight: bold;
              font-size: ${fontNome};
              margin: ${nomeMarginTop} 0 0 0;
              padding: 0;
              line-height: 1;
              width: 100%;
              text-align: center;
              word-break: break-word;
            }
            .barcode {
              width: 90%;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
      `);


    indicesParaImprimir.forEach((idx, i) => {
      const item = listaLocalizacoes[idx];
      const nomeLimpo = isPrateleira ? processarNomePrateleira(item.nome) : item.nome;
      const nomeEscapado = nomeLimpo.replace(/'/g, "\\'");
      const eanEscapado = item.ean.replace(/'/g, "\\'");


      w.document.write(`
          <div class="etiqueta" data-ean="${eanEscapado}">
            <div class="nome" id="nome-${i}">${nomeEscapado}</div>
            <svg class="barcode" id="barcode-${i}"></svg>
          </div>
        `);
    });

    w.document.write(`
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = () => {
            console.log('=== INÍCIO GERAÇÃO DE ETIQUETAS EM LOTE ===');
            
            let barcodesProcessados = 0;
            const totalBarcodes = document.querySelectorAll('.etiqueta').length;
            
            document.querySelectorAll('.etiqueta').forEach((div, index) => {
              const nome = div.querySelector('.nome').innerText;
              const svg = div.querySelector('.barcode');
              const ean = div.dataset.ean;

              let tamanho = ${fontNome.replace('px', '')};
              if (nome.length > 8)      tamanho = 50;
              else if (nome.length > 6) tamanho = 90;

              document.getElementById('nome-' + index).style.fontSize = tamanho + 'px';
              console.log('Ajustando fonte do item ' + index + ' para:', tamanho + 'px');

              console.log('Batch generating barcode for EAN:', ean);
              console.log('Barcode element:', svg);
              
              if (!ean || ean.trim() === '') {
                console.error('EAN vazio ou inválido:', ean);
                return;
              }
              
              try {
                if (!svg) {
                  console.error('Elemento SVG não encontrado');
                  return;
                }
                
                console.log('Tentando gerar barcode ' + (index + 1) + '/' + totalBarcodes + '...');
                JsBarcode(svg, ean, {
                  format: 'ean13',
                  height: ${barHeight},
                  displayValue: true,
                  fontSize: ${barFont}
                });
                console.log('Batch barcode generated successfully for EAN:', ean);
                barcodesProcessados++;
                
                // Se todos os barcodes foram processados, inicia a impressão
                if (barcodesProcessados === totalBarcodes) {
                  setTimeout(() => {
                    console.log('Todos os barcodes processados. Iniciando impressão...');
                    window.print();
                    window.onafterprint = () => {
                      console.log('Fechando janela após impressão...');
                      window.close();
                    };
                  }, 1000);
                }
              } catch (error) {
                console.error('Error generating batch barcode for EAN:', ean, error);
                console.error('Error details:', error.message, error.stack);
                alert('Erro ao gerar código de barras para EAN: ' + ean + ' - ' + error.message);
              }
            });
          };
        </script>
        </body>
        </html>
      `);


    w.document.close();
  };

  /* ------------------------- exclusão ------------------------- */
  const handleExcluir = async (id: number, nome: string, quantidade: number) => {
    if (quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }
    if (!window.confirm(`Deseja excluir a localização "${nome}"?`)) return;
    try {
      await excluirLocalizacao({ localizacao_id: id });
      setListaLocalizacoes((prev) => prev.filter((l) => l.localizacao_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcluirSelecionados = async () => {
    if (!selectedItems.length) {
      alert('Selecione pelo menos uma localização.');
      return;
    }

    const permitidos = selectedItems.filter((idx) => listaLocalizacoes[idx].total_produtos === 0);
    const bloqueados = selectedItems.filter((idx) => listaLocalizacoes[idx].total_produtos > 0);

    if (!permitidos.length) {
      alert('Nenhuma das localizações selecionadas pode ser excluída (quantidade > 0).');
      return;
    }

    const nomesPermitidos = permitidos.map((idx) => listaLocalizacoes[idx].nome);
    if (!window.confirm(`Tem certeza que deseja excluir:\n\n${nomesPermitidos.join(', ')}`)) return;

    const erros: string[] = [];
    for (const idx of permitidos) {
      const loc = listaLocalizacoes[idx];
      try {
        await excluirLocalizacao({ localizacao_id: loc.localizacao_id });
      } catch (err) {
        console.error(err);
        erros.push(loc.nome);
      }
    }

    setListaLocalizacoes((prev) =>
      prev.filter((_, idx) => !permitidos.includes(idx) || erros.includes(prev[idx].nome))
    );

    setSelectedItems([]);
    setSelectAll(false);

    if (erros.length) {
      alert(`Algumas localizações não foram excluídas: ${erros.join(', ')}`);
    } else {
      alert('Localizações excluídas com sucesso!');
    }

    if (bloqueados.length) {
      const nomesBloq = bloqueados.map((idx) => listaLocalizacoes[idx].nome);
      alert(`Estas localizações não puderam ser excluídas por conter produtos:\n\n${nomesBloq.join(', ')}`);
    }
  };

  // Atualize a função de aplicar filtros:


  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage}>

      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Localização
      </Typography>

      {/* Barra de ações */}
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Buscar Localização, tipo, armazém ou EAN"
          variant="outlined"
          size="small"
          value={inputBusca}
          onChange={(e) => setInputBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setBusca(inputBusca); // atualiza a busca real
            }
          }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ maxWidth: 480, width: 380 }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleMenuOpen}
          sx={{
            minWidth: 110,
            backgroundColor: filtrosAtivos.algum ? '#f0f0f0' : 'transparent',
            borderColor: filtrosAtivos.algum ? '#999' : undefined,
            color: filtrosAtivos.algum ? '#333' : undefined,
            fontWeight: filtrosAtivos.algum ? 'bold' : 'normal',
          }}
        >
          Filtro
        </Button>

        {filtrosAtivos.algum && (
          <>
            {filtrosAtivos.tipo && (
              <Chip
                label={`Filtro: Tipo - ${appliedFiltroTipo}`}
                sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', mx: 0.5 }}
              />
            )}
            {filtrosAtivos.armazem && (
              <Chip
                label={`Filtro: Armazém - ${appliedFiltroArmazem}`}
                sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', mx: 0.5 }}
              />
            )}
            <Button
              variant="outlined"
              onClick={handleLimparFiltro}
              sx={{ height: 32, ml: 1 }}
            >
              Limpar Filtro
            </Button>
          </>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <Box sx={{ p: 2, width: 260 }}>
            <TextField
              select
              label="Tipo de Localização"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              sx={{ minWidth: '100%', mb: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...new Set(listaLocalizacoes.map((i) => i.tipo))].map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Armazém"
              value={filtroArmazem}
              onChange={(e) => setFiltroArmazem(e.target.value)}
              sx={{ minWidth: '100%' }}
            >
              <MenuItem value="">Todos</MenuItem>
              {[...new Set(listaLocalizacoes.map((i) => i.armazem))].map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="outlined" sx={{ mt: 2, width: '100%' }} onClick={handleAplicarFiltro}>
              Aplicar
            </Button>

            {(filtroTipo || filtroArmazem) && (
              <Button variant="outlined" sx={{ mt: 1, width: '100%' }} onClick={handleLimparFiltro}>
                Limpar filtro
              </Button>
            )}
          </Box>
        </Menu>

        {selectedItems.length > 0 ? (
          <>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handleImprimirSelecionados}
              sx={{
                backgroundColor: '#61de27',
                color: '#000',
                fontWeight: 'bold',
                minWidth: 195,
                '&:hover': { backgroundColor: '#48c307' },
              }}
            >
              Imprimir Selecionados
            </Button>

            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (temPermissao('localizacao', 'excluir')) {
                  handleExcluirSelecionados();
                } else {
                  alert('Você não tem permissão para excluir localizações');
                }
              }}
              disabled={!temPermissao('localizacao', 'excluir')}
              sx={{
                borderColor: '#d32f2f',
                color: '#d32f2f',
                fontWeight: 'bold',
                minWidth: 185,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  borderColor: '#d32f2f',
                },
              }}
            >
              Excluir Selecionados
            </Button>
          </>
        ) : (
          <BotaoComPermissao
            modulo="localizacao"
            acao="incluir"
            onClick={() => navigate('/localizacao/criar')}
            mensagemSemPermissao="Você não tem permissão para criar localizações"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#61de27',
              color: '#000',
              fontWeight: 'bold',
              minWidth: 165,
              '&:hover': { backgroundColor: '#48c307' },
            }}
          >
            Nova Localização
          </BotaoComPermissao>
        )}
      </Box>

      {/* Tabela principal */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 'auto', overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  indeterminate={selectedItems.length > 0 && !selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}

                />
              </TableCell>

              <TableCell align='center' sortDirection={orderBy === 'nome' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'nome'}
                  direction={orderBy === 'nome' ? orderDirection : 'asc'}
                  onClick={() => handleSort('nome')}
                >
                  <strong>Nome</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align='center' sortDirection={orderBy === 'tipo' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'tipo'}
                  direction={orderBy === 'tipo' ? orderDirection : 'asc'}
                  onClick={() => handleSort('tipo')}
                >
                  <strong>Tipo</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align='center' sortDirection={orderBy === 'armazem' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'armazem'}
                  direction={orderBy === 'armazem' ? orderDirection : 'asc'}
                  onClick={() => handleSort('armazem')}
                >
                  <strong>Armazém</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align='center' sortDirection={orderBy === 'ean' ? orderDirection : false}>
                <strong>EAN</strong>
              </TableCell>

              <TableCell align='center' sortDirection={orderBy === 'total_produtos' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'total_produtos'}
                  direction={orderBy === 'total_produtos' ? orderDirection : 'asc'}
                  onClick={() => handleSort('total_produtos')}
                >
                  <strong>Quantidade</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align='center'>
                <strong>Ações</strong>
              </TableCell>


            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((item, idx) => {
                const originalIndex = currentIndices[idx];
                const isSelected = selectedItems.includes(originalIndex);
                return (
                  <TableRow key={`${item.nome}-${originalIndex}`} selected={isSelected} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(originalIndex, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{ 
                        fontWeight: 500, 
                        cursor: temPermissao('localizacao', 'editar') ? 'pointer' : 'default', 
                        pr: orderBy === 'nome' ? 'auto' : '35px'
                      }}
                      onClick={() => {
                        if (temPermissao('localizacao', 'editar')) {
                          navigate(`/localizacao/${item.localizacao_id}/editar`);
                        } else {
                          alert('Você não tem permissão para editar localizações');
                        }
                      }}
                      
                    >
                      {item.nome}
                    </TableCell>
                    <TableCell align='center' sx={{ pr: orderBy === 'tipo' ? 'auto' : '35px' }}>{item.tipo}</TableCell>
                    <TableCell align='center' sx={{ pr: orderBy === 'armazem' ? 'auto' : '35px' }}>{item.armazem}</TableCell>
                    <TableCell align="center">{item.ean}</TableCell>
                    <TableCell align="center" sx={{ pr: orderBy === 'total_produtos' ? 'auto' : '35px' }}>{item.total_produtos}</TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="Ver produtos">
                          <IconButton
                            size="small"
                            onClick={() => handleVerProdutos(item.localizacao_id, item.nome)}
                          >
                            <ListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir etiqueta">
                          <IconButton size="small" onClick={() => handleImprimir(item.nome, item.ean, item.tipo, item.armazem)}>
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir localização">
                                                  <IconButton
                          size="small"
                          onClick={() => {
                            if (temPermissao('localizacao', 'excluir')) {
                              handleExcluir(item.localizacao_id, item.nome, item.total_produtos ?? 0);
                            } else {
                              alert('Você não tem permissão para excluir localizações');
                            }
                          }}
                          disabled={item.total_produtos > 0 || !temPermissao('localizacao', 'excluir')}
                          sx={{
                              color: item.total_produtos > 0 ? 'text.disabled' : 'error.main',
                              '&:hover': {
                                backgroundColor: item.total_produtos > 0 ? 'transparent' : 'rgba(211, 47, 47, 0.1)',
                              },
                            }}

                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma localização encontrada.
                  </Typography>
                </TableCell>
              </TableRow>

            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de produtos */}
      {localizacaoSelecionada && (
        <ProdutosLocalizacaoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          localizacao_id={localizacaoSelecionada.id}
          localizacaoNome={localizacaoSelecionada.nome}
          onQuantidadeAtualizada={handleQuantidadeAtualizada}
        />
      )}
    </Layout>
  );
};

export default Localizacao;
