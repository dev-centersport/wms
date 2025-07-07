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
import Layout from "./components/Layout";
import theme from './components/Theme';
import CriarArmazem from "./pages/CriarArmazem";
import EditarLocalizacao from "./pages/EditarLocalizacao"
import EditarArmazem from "./pages/EditarArmazem"
import  TipoLocalizacao  from "./pages/TipoLocalizacao";
import CriarTipoLocalizacao from "./pages/CriarTipoLocalizacao";
import EditarTipoLocalizacao from "./pages/EditarTipoLocalizacao";

import Sidebar from "./components/Sidebar";



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
          <Route path="/armazem" element={<Sidebar><Armazem /></Sidebar>} />
          <Route path="/localizacao" element={<Sidebar><Localizacao /></Sidebar>} />
          <Route path="/CriarArmazem" element={<Sidebar><CriarArmazem /></Sidebar>} />
          <Route path="/EditarArmazem/:id" element={<Sidebar><EditarArmazem /></Sidebar>} />
          <Route path="/TipoLocalizacao" element={<Sidebar><TipoLocalizacao></TipoLocalizacao></Sidebar>}/>
          <Route path="/tipo-localizacao/:id/editar" element={<Sidebar><EditarTipoLocalizacao /></Sidebar>} />
          <Route path="/CriarTipoLocalizacao" element={<Sidebar><CriarTipoLocalizacao /></Sidebar>} />
          <Route path="/CriarLocalizacao" element={<Sidebar><CriarLocalizacao /></Sidebar>} />
          <Route path="/localizacao/:id/editar" element={<Sidebar><EditarLocalizacao /></Sidebar>} />
          <Route path="/CriarArmazem" element={<Sidebar><CriarArmazem /></Sidebar>} />

          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>

  
);
