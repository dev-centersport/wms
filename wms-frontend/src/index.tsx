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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
          <Route path="/armazem" element={<Armazem />} />
          <Route path="/localizacao" element={<Localizacao />} />
          <Route path="/CriarLocalizacao" element={<CriarLocalizacao />} />
          <Route path="/localizacao/:id/editar" element={<EditarLocalizacao />} />
          <Route path="/CriarArmazem" element={<CriarArmazem />} />
=======
=======
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
=======
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
          <Route path="/armazem" element={<Layout><Armazem /></Layout>} />
          <Route path="/localizacao" element={<Layout><Localizacao /></Layout>} />
          <Route path="/CriarLocalizacao" element={<Layout><CriarLocalizacao /></Layout>} />
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)

          {/* Rota padrão redireciona para login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>

  
);
