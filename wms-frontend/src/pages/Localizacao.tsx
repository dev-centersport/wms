import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Container,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Checkbox,
    Tooltip,
    MenuItem,
    Menu,
} from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Print as PrintIcon, List as ListIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';

import Layout from '../components/Layout';
import { useLocalizacoes } from '../components/ApiComponents';
import { excluirLocalizacao } from '../services/API';
import { buscarLocalizacoes, buscarConsultaEstoque } from '../services/API';
import ProdutosLocalizacaoModal from '../components/ProdutosLocalizacaoModal';

type LocalizacaoComQtd = {
  localizacao_id: number;
  nome: string;
  tipo: string;
  armazem: string;
  ean: string;
  total_produtos: number;
};

/* -------------------------------------------------------------------------- */

const Localizacao: React.FC = () => {
    /* ------------------------- estados globais do hook ------------------------- */
    const [listaLocalizacoes, setListaLocalizacoes] = useState<LocalizacaoComQtd[]>([]);
    const [busca, setBusca] = useState('');

    const navigate = useNavigate();

    /* ---------------------------- estados locais ---------------------------- */
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroArmazem, setFiltroArmazem] = useState<string>('');

    // Adicione no início do componente:
    const [itemsPerPage, setItemsPerPage] = useState<number>(100);
    // const availablePageSizes = [50, 100, 200, 500]; // Opções disponíveis

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
         
    // Estados para o modal de produtos
    const [modalOpen, setModalOpen] = useState(false);

    const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState<{id: number, nome: string} | null>(null);


    useEffect(() => {
      const carregar = async () => {
        try {
          const [locs, estoque] = await Promise.all([
            buscarLocalizacoes(), // lista sem quantidade
            buscarConsultaEstoque(), // cada item tem localizacao_id e quantidade
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
    }, []);

    /* ------------------------------ filtragem ------------------------------ */
    const [appliedFiltroTipo, setAppliedFiltroTipo] = useState<string>('');
    const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState<string>('');

    const filteredIndices = useMemo(() => {
      return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
        const termo = busca.trim().toLowerCase();
        const matchBusca =
          termo === '' ||
          [loc.nome, loc.tipo, loc.armazem, loc.ean]
            .filter(Boolean)
            .some((campo) => campo.toString().toLowerCase().includes(termo));

        const matchTipo = !appliedFiltroTipo || loc.tipo === appliedFiltroTipo;
        const matchArmazem = !appliedFiltroArmazem || loc.armazem === appliedFiltroArmazem;

        if (matchBusca && matchTipo && matchArmazem) acc.push(idx);
        return acc;
      }, []);
    }, [listaLocalizacoes, busca, appliedFiltroTipo, appliedFiltroArmazem]);

    /* ---------------------------- paginação ---------------------------- */
    const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIndices = filteredIndices.slice(startIndex, endIndex);
    const currentItems = currentIndices.map((i) => listaLocalizacoes[i]);

    /* ------------------------- efeitos auxiliares ------------------------ */
    useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);

    useEffect(() => {

      setCurrentPage(1);
    }, [busca, appliedFiltroTipo, appliedFiltroArmazem]);


    useEffect(() => {
      const allCurrentSelected =
        currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
      setSelectAll(allCurrentSelected);
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

    const handleImprimir = (localizacao: string, ean: string, tipo: string, armazem: string) => {
      const tipoLower = tipo.toLowerCase();
      if (tipoLower.includes('caixa')) {
        handleImprimirCaixa(localizacao, ean, armazem);
        return;
      }
      const w = window.open('', '_blank');
      if (!w) return;

      /* ------------------------------------------------------------------ */
      /* 1. Identificação do tipo                                           */
      /* ------------------------------------------------------------------ */
         
      const isCaixa = tipoLower.includes('caixa');
      const isPrateleira = tipoLower.includes('prateleira');

      /* ------------------------------------------------------------------ */
      /* 2. Dimensões, fontes e código de barras                            */
      /* ------------------------------------------------------------------ */

      const largura = isCaixa || isPrateleira ? '10cm' : '5cm';
      const altura = isCaixa ? '15cm' : isPrateleira ? '5cm' : '10cm';

      const fontNome = '120px';                   // tamanho base
      const barHeight = isCaixa ? 90 : 20;        // altura barra
      const barFont = isCaixa ? 22 : 10;          // fonte barra

      /* ------------------------------------------------------------------ */
      /* 3. Transformação do nome para Prateleira                           */
      /* ------------------------------------------------------------------ */

      const nomeImpresso = isPrateleira
        ? localizacao.replace(/^.*?#/, '')
        : localizacao;

      /* ------------------------------------------------------------------ */
      /* 4. Estilos condicionais                                            */
      /* ------------------------------------------------------------------ */

      const bodyJustify = isPrateleira ? 'flex-start' : 'center'; // prateleira cola no topo
      const nomeMarginTop = isPrateleira ? '-3mm' : '0';          // só prateleira sobe

      /* ------------------------------------------------------------------ */
      /* 5. HTML completo                                                   */
      /* ------------------------------------------------------------------ */

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
                    margin: 0;                /* zero espaço entre nome e código */
                    padding: 0;
                }
            </style>
        </head>
        <body>
            <div id="nome">${nomeImpresso}</div>
            <svg id="barcode"></svg>

            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
                /* ---------- ajuste dinâmico de fonte conforme tamanho do texto -------- */
                const nomeEl  = document.getElementById('nome');
                const texto   = '${nomeImpresso}';
                let tamanho   = ${fontNome.replace('px', '')};

                if (texto.length > 8)      tamanho = 50;
                else if (texto.length > 5) tamanho = 180;

                nomeEl.style.fontSize = tamanho + 'px';

                /* ------------------- geração do código de barras ----------------------- */
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
            if (tipo.includes('caixa') || tipo.includes('prateleira')) return idx;
            return -1;
          })
          .filter((idx) => idx !== -1);

        setSelectedItems(indicesParaImprimir);
        setSelectAll(false);
      }

      if (!indicesParaImprimir.length) {
        alert('Nenhuma localização do tipo "Caixa" ou "Prateleira" encontrada.');
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
      if (tipoAtual.includes('caixa')) {
        handleImprimirSelecionadosCaixa();
      } else {
        handleImprimirSelecionadosPrateleira();
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
        const armazemEscapado = item.armazem.replace(/'/g, "\\'");
        const eanEscapado = item.ean.replace(/'/g, "\\'");
        
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
        const nomeLimpo = isPrateleira ? item.nome.replace(/^.*?#/, '') : item.nome;
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
            document.querySelectorAll('.etiqueta').forEach((div, index) => {
              const nome = div.querySelector('.nome').innerText;
              const svg = div.querySelector('.barcode');
              const ean = div.dataset.ean;

              let tamanho = ${fontNome.replace('px', '')};
              if (nome.length > 8)      tamanho = 50;
              else if (nome.length > 6) tamanho = 90;

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

    /* ---------------------- valores únicos para filtros --------------------- */
    const [todosTipos, setTodosTipos] = useState<{ tipo: string; id: any }[]>([]);
    const [todosArmazens, setTodosArmazens] = useState<{ armazem: string; id: any }[]>([]);


    useEffect(() => {
        async function buscarFiltros() {
            try {
                // Busca "todos" os registros, só para montar os filtros
                const res = await buscarLocalizacoes(10000, 0); // ou um número que garanta trazer tudo
                const todos = res.results;
                console.log(todos)

                // Extrai tipos únicos e armazéns únicos
                const tipos = Array.from(
                new Map(
                    todos
                    .filter((l: any) => l.tipo && l.tipo_localizacao_id) // supondo que existe l.tipo_id!
                    .map((l: any) => [l.tipo_localizacao_id, { tipo: l.tipo, id: l.tipo_localizacao_id }])
                ).values()
                ).sort((a, b) => a.tipo.localeCompare(b.tipo));

                const armazens = Array.from(
                new Map(
                    todos
                    .filter((l: any) => l.armazem && l.armazem_id)
                    .map((l: any) => [l.armazem_id, { armazem: l.armazem, id: l.armazem_id }])
                ).values()
                ).sort((a, b) => a.armazem.localeCompare(b.armazem));

                console.log('tipos de localizacoes' , tipos)


                setTodosTipos(tipos);
                setTodosArmazens(armazens);
            } catch (e) {
                console.error('Erro ao buscar filtros:', e);
            }
        }

        buscarFiltros();
    }, []);


    /* --------------------------- handlers menu --------------------------- */
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // Atualize a função de aplicar filtros:
    const handleAplicarFiltro = () => {
        setCurrentPage(1); // Resetar para a primeira página ao aplicar filtros
        setAppliedFiltroTipo(filtroTipo);
        setAppliedFiltroArmazem(filtroArmazem);
        handleMenuClose();
    };

    // Atualize a função de limpar filtros:
    const handleLimparFiltros = () => {
        setCurrentPage(1); // Resetar para a primeira página ao limpar filtros
        setFiltroTipo('');
        setFiltroArmazem('');
        setBusca('');
        setAppliedFiltroTipo('');
        setAppliedFiltroArmazem('');
        handleMenuClose();
    };

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

                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}

                    sx={{ maxWidth: 480, width: 380 }}
                />

                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleMenuOpen}
                    sx={{ minWidth: 110 }}
                >
                    Filtro
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <Box sx={{ p: 2, width: 300 }}>
                        <TextField
                            select
                            label="Tipo"
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            sx={{ minWidth: '100%' }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {todosTipos.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.tipo}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Armazém"
                            value={filtroArmazem}
                            onChange={(e) => setFiltroArmazem(e.target.value)}
                            sx={{ minWidth: '100%', mt: 2 }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {todosArmazens.map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                    {a.armazem}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="outlined"
                            onClick={handleAplicarFiltro}
                            sx={{ mt: 2, width: '100%' }}
                        >
                            Aplicar Filtro
                        </Button>

                        {filtroTipo || filtroArmazem ? (
                            <Button
                                variant="outlined"
                                onClick={handleLimparFiltros}
                                sx={{ mt: 2, width: '100%' }}
                            >
                                Limpar filtros
                            </Button>
                        ) : null}
                    </Box>
                </Menu>

                {/* Novo botão Limpar Filtros ao lado do botão Filtro */}
                {(filtroTipo || filtroArmazem) && (
                    <Button
                        variant="outlined"
                        onClick={handleLimparFiltros}
                        sx={{ minWidth: 130, ml: 1 }}
                    >
                        Limpar Filtros
                    </Button>
                )}

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
                            onClick={handleExcluirSelecionados}
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/CriarLocalizacao')}
                        sx={{
                            backgroundColor: '#61de27',
                            color: '#000',
                            fontWeight: 'bold',
                            minWidth: 165,
                            '&:hover': { backgroundColor: '#48c307' },
                        }}
                    >
                        Nova Localização
                    </Button>
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

                            <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Armazém</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>EAN</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>

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
                                            sx={{ fontWeight: 500, cursor: 'pointer' }}
                                            onClick={() => navigate(`/localizacao/${item.localizacao_id}/editar`)}
                                        >
                                            {item.nome}
                                        </TableCell>
                                        <TableCell>{item.tipo}</TableCell>
                                        <TableCell>{item.armazem}</TableCell>
                                        <TableCell align="center">{item.ean}</TableCell>
                                        <TableCell align="center">{item.total_produtos}</TableCell>
                                        <TableCell align="center">
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
                                                        onClick={() => handleExcluir(item.localizacao_id, item.nome, item.total_produtos ?? 0)}
                                                        disabled={item.total_produtos > 0}
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
