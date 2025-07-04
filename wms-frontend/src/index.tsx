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
import TelaTeste from "./pages/TelaTeste";


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
          <Route path="/telateste" element={<TelaTeste />} />

          {/* Páginas internas com Sidebar */}
          <Route path="/armazem" element={<Layout><Armazem /></Layout>} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/CriarLocalizacao" element={<Layout><CriarLocalizacao /></Layout>} />

          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>

  
);
