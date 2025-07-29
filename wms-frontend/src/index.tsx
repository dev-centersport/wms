import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, TextareaAutosize } from '@mui/material';
import ReactDOM from 'react-dom/client';
import App from './App';

import "./index.css";

import Armazem from "./pages/Armazem";
import Login from "./pages/Login";
import Localizacao from "./pages/Localizacao";
import CriarLocalizacao from "./pages/CriarLocalizacao";
import CriarArmazem from "./pages/CriarArmazem";
import EditarLocalizacao from "./pages/EditarLocalizacao"
import EditarArmazem from "./pages/EditarArmazem"
import  TipoLocalizacao  from "./pages/TipoLocalizacao";
import CriarTipoLocalizacao from "./pages/CriarTipoLocalizacao";
import EditarTipoLocalizacao from "./pages/EditarTipoLocalizacao";
import Produto from "./pages/Produto";
import Consulta from "./pages/consulta";
import Movimentacao from "./pages/Movimentacao";
import Separacao from "./pages/Separacao";
import Ocorrencias from "./pages/Ocorrencias";
import NovaOcorrencia from "./pages/NovaOcorrencia";
import ConferenciaAudi from "./pages/ConferenciaAudi";
import Auditoria from "./pages/Auditoria";
import Relatorio from "./pages/Relatorio";
import Usuarios from "./pages/Usuarios";
import CriarUsuario from "./pages/CriarUsuario"

import theme from './components/Theme';

const container = document.getElementById("root");
if (!container) throw new Error("Elemento root não encontrado no HTML.");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Login sem menu lateral */}
          <Route path="/login" element={<Login />} />
          {/* Páginas internas com Sidebar */}
          {/* Páginas de localização */}
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/localizacao/criar" element={<CriarLocalizacao />} />
          <Route path="/localizacao/:id/editar" element={<EditarLocalizacao />} />

          {/* Páginas de Armazém */}
          <Route path="/armazem" element={<Armazem />} />
          <Route path="/criar-armazem" element={<CriarArmazem />} />
          <Route path="/armazem/:id/editar" element={<EditarArmazem />} />

          {/* Páginas de Tipo de localização */}
          <Route path="/tipo-localizacao" element={<TipoLocalizacao />}/>
          <Route path="/tipo-localizacao/:id/editar" element={<EditarTipoLocalizacao />} />
          <Route path="/tipo-localizacao/criar" element={<CriarTipoLocalizacao />} />

          {/* {/ Pagina de Produto} s */}
          <Route path="/produto" element={<Produto />}/>
          <Route path="/consulta" element={<Consulta />}/>
          <Route path="/movimentacao" element={<Movimentacao/>}/>
          <Route path="/separacao" element={<Separacao/>}/>
          <Route path="/ocorrencias" element={<Ocorrencias/>}/>
          <Route path="/Auditoria" element={<Auditoria/>}/>
          <Route path="/Relatorio" element={<Relatorio/>}/>
          <Route path="/NovaOcorrencia" element={<NovaOcorrencia/>}/>
          <Route path="/ConferenciaAudi/:id" element={<ConferenciaAudi />} />

          {/* Usuarios */}
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/criarusuario" element={<CriarUsuario />} />

          {/* Redirecionamentos */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
