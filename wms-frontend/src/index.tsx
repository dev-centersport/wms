import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, TextareaAutosize } from '@mui/material';
import ReactDOM from 'react-dom/client';
import App from './App';

import "./index.css";

import Armazem from "./pages/Armazem";
import Login from "./pages/Login";

import Localizacao from "./pages/Localizacao";
import CriarLocalizacao from "./pages/CriarLocalizacao";
// import Layout from "./components/Layout";
import theme from './components/Theme';
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
import NovaOcorrencias from "./pages/NovaOcorrencias";

import Sidebar from "./components/Sidebar";
import Auditoria from "./pages/Auditoria";



const container = document.getElementById("root");
if (!container) {
  throw new Error("Elemento root não encontrado no HTML.");
}

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
          <Route path="/CriarLocalizacao" element={<CriarLocalizacao />} />
          <Route path="/localizacao/:id/editar" element={<EditarLocalizacao />} />

          {/* Páginas de Armazém */}
          <Route path="/armazem" element={<Armazem />} />
          <Route path="/CriarArmazem" element={<CriarArmazem />} />
          <Route path="/EditarArmazem/:id" element={<EditarArmazem />} />

          {/* Páginas de Tipo de localização */}
          <Route path="/TipoLocalizacao" element={<TipoLocalizacao />}/>
          <Route path="/tipo-localizacao/:id/editar" element={<EditarTipoLocalizacao />} />
          <Route path="/CriarTipoLocalizacao" element={<CriarTipoLocalizacao />} />

          {/* {/ Pagina de Produto} s */}
          <Route path="/produto" element={<Produto />}/>
          <Route path="/consulta" element={<Consulta />}/>
          <Route path="/movimentacao" element={<Movimentacao/>}/>
          <Route path="/separacao" element={<Separacao/>}/>
          <Route path="/ocorrencias" element={<Ocorrencias/>}/>
          <Route path="/Auditoria" element={<Auditoria/>}/>
          <Route path="/NovaOcorrencias" element={<NovaOcorrencias/>}/>

          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>

  
);
