import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from '@mui/material';

import "./index.css";

import Armazem from "./pages/Armazem";
import Login from "./pages/Login";

import Localizacao from "./pages/Localizacao";
import CriarLocalizacao from "./pages/CriarLocalizacao";
import Layout from "./components/Layout";
import theme from './components/Theme';
import CriarArmazem from "./pages/CriarArmazem";
import EditarLocalizacao from "./pages/EditarLocalizacao";

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
          <Route path="/armazem" element={<Armazem />} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/CriarLocalizacao" element={<CriarLocalizacao />} />
          <Route path="/localizacao/:id/editar" element={<EditarLocalizacao />} />
          <Route path="/CriarArmazem" element={<CriarArmazem />} />
          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
