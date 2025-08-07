import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, TextareaAutosize } from '@mui/material';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loading from './components/Loading';

import "./index.css";

import Armazem from "./pages/Armazem";
import Login from "./pages/Login";
import Localizacao from "./pages/Localizacao";
import CriarLocalizacao from "./pages/CriarLocalizacao";
import CriarArmazem from "./pages/CriarArmazem";
import EditarLocalizacao from "./pages/EditarLocalizacao"
import EditarArmazem from "./pages/EditarArmazem"
import Armazem3D from "./pages/Armazem3D";
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
import PerfilUsuario from "./pages/PerfilUsuario";
import CriarPerfilUsuario from "./pages/CriarPerfilUsuario";
import VisualizarPerfilUsuario from "./pages/VisualizarPerfilUsuario";
import Dashboard from "./pages/Dashboard";

import theme from './components/Theme';
import { inicializarPermissoesPadrao } from './utils/permissoes-inicializacao';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rotas públicas (como login)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="Verificando autenticação..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/localizacao" replace />; // Redireciona para uma página padrão após login
  }

  return <>{children}</>;
};



const container = document.getElementById("root");
if (!container) throw new Error("Elemento root não encontrado no HTML.");

const root = createRoot(container);

// Inicializar permissões padrão quando o app carregar
inicializarPermissoesPadrao().catch(error => {
  console.warn('Não foi possível inicializar permissões padrão:', error);
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Login sem menu lateral */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          {/* Páginas internas com Sidebar */}
          {/* Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Páginas de localização */}
          <Route path="/localizacao" element={
            <ProtectedRoute>
              <Localizacao />
            </ProtectedRoute>
          } />
          <Route path="/localizacao/criar" element={
            <ProtectedRoute>
              <CriarLocalizacao />
            </ProtectedRoute>
          } />
          <Route path="/localizacao/:id/editar" element={
            <ProtectedRoute>
              <EditarLocalizacao />
            </ProtectedRoute>
          } />

          {/* Páginas de Armazém */}
          <Route path="/armazem" element={
            <ProtectedRoute>
              <Armazem />
            </ProtectedRoute>
          } />
          <Route path="/criar-armazem" element={
            <ProtectedRoute>
              <CriarArmazem />
            </ProtectedRoute>
          } />
          <Route path="/armazem/:id/editar" element={
            <ProtectedRoute>
              <EditarArmazem />
            </ProtectedRoute>
          } />
          
          {/* Página do Armazém 3D */}
          <Route path="/armazem-3d" element={
            <ProtectedRoute>
              <Armazem3D />
            </ProtectedRoute>
          } />

          {/* Páginas de Tipo de localização */}
          <Route path="/tipo-localizacao" element={
            <ProtectedRoute>
              <TipoLocalizacao />
            </ProtectedRoute>
          }/>
          <Route path="/tipo-localizacao/:id/editar" element={
            <ProtectedRoute>
              <EditarTipoLocalizacao />
            </ProtectedRoute>
          } />
          <Route path="/tipo-localizacao/criar" element={
            <ProtectedRoute>
              <CriarTipoLocalizacao />
            </ProtectedRoute>
          } />

          {/* {/ Pagina de Produto} s */}
          <Route path="/produto" element={
            <ProtectedRoute>
              <Produto />
            </ProtectedRoute>
          }/>
          <Route path="/consulta" element={
            <ProtectedRoute>
              <Consulta />
            </ProtectedRoute>
          }/>
          <Route path="/movimentacao" element={
            <ProtectedRoute>
              <Movimentacao/>
            </ProtectedRoute>
          }/>
          <Route path="/separacao" element={
            <ProtectedRoute>
              <Separacao/>
            </ProtectedRoute>
          }/>
          <Route path="/ocorrencias" element={
            <ProtectedRoute>
              <Ocorrencias/>
            </ProtectedRoute>
          }/>
          <Route path="/Auditoria" element={
            <ProtectedRoute>
              <Auditoria/>
            </ProtectedRoute>
          }/>
          <Route path="/Relatorio" element={
            <ProtectedRoute>
              <Relatorio/>
            </ProtectedRoute>
          }/>
          <Route path="/NovaOcorrencia" element={
            <ProtectedRoute>
              <NovaOcorrencia/>
            </ProtectedRoute>
          }/>
          <Route path="/ConferenciaAudi/:id" element={
            <ProtectedRoute>
              <ConferenciaAudi />
            </ProtectedRoute>
          } />

          {/* Usuarios */}
          <Route path="/usuarios" element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          } />
          <Route path="/criarusuario" element={
            <ProtectedRoute>
              <CriarUsuario />
            </ProtectedRoute>
          } />
          
          {/* Perfis de Usuário */}
          <Route path="/perfil-usuario" element={
            <ProtectedRoute>
              <PerfilUsuario />
            </ProtectedRoute>
          } />
          <Route path="/perfil-usuario/criar" element={
            <ProtectedRoute>
              <CriarPerfilUsuario />
            </ProtectedRoute>
          } />
          <Route path="/perfil-usuario/editar" element={
            <ProtectedRoute>
              <CriarPerfilUsuario />
            </ProtectedRoute>
          } />
          <Route path="/perfil-usuario/visualizar" element={
            <ProtectedRoute>
              <VisualizarPerfilUsuario />
            </ProtectedRoute>
          } />

          {/* Redirecionamentos */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
