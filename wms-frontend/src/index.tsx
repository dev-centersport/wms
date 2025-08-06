import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from '@mui/material';
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
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionRoute from "./components/PermissionRoute";
import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";

import theme from './components/Theme';

const container = document.getElementById("root");
if (!container) throw new Error("Elemento root não encontrado no HTML.");

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Login sem menu lateral */}
            <Route path="/login" element={<Login />} />
            
            {/* Páginas internas com Layout (Sidebar) */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Páginas de localização */}
              <Route path="localizacao" element={
                <PermissionRoute requiredPermission="canViewLocalizacao">
                  <Localizacao />
                </PermissionRoute>
              } />
              <Route path="localizacao/criar" element={
                <PermissionRoute requiredPermission="canAddLocalizacao">
                  <CriarLocalizacao />
                </PermissionRoute>
              } />
              <Route path="localizacao/:id/editar" element={
                <PermissionRoute requiredPermission="canEditLocalizacao">
                  <EditarLocalizacao />
                </PermissionRoute>
              } />

              {/* Páginas de Armazém */}
              <Route path="armazem" element={
                <PermissionRoute requiredPermission="canViewArmazem">
                  <Armazem />
                </PermissionRoute>
              } />
              <Route path="criar-armazem" element={
                <PermissionRoute requiredPermission="canAddArmazem">
                  <CriarArmazem />
                </PermissionRoute>
              } />
              <Route path="armazem/:id/editar" element={
                <PermissionRoute requiredPermission="canEditArmazem">
                  <EditarArmazem />
                </PermissionRoute>
              } />
              
              {/* Página do Armazém 3D */}
              <Route path="armazem-3d" element={
                <PermissionRoute requiredPermission="canViewArmazem3D">
                  <Armazem3D />
                </PermissionRoute>
              } />

              {/* Páginas de Tipo de localização */}
              <Route path="tipo-localizacao" element={
                <PermissionRoute requiredPermission="canViewTipoLocalizacao">
                  <TipoLocalizacao />
                </PermissionRoute>
              } />
              <Route path="tipo-localizacao/:id/editar" element={
                <PermissionRoute requiredPermission="canEditTipoLocalizacao">
                  <EditarTipoLocalizacao />
                </PermissionRoute>
              } />
              <Route path="tipo-localizacao/criar" element={
                <PermissionRoute requiredPermission="canAddTipoLocalizacao">
                  <CriarTipoLocalizacao />
                </PermissionRoute>
              } />

              {/* Página de Produto */}
              <Route path="produto" element={
                <PermissionRoute requiredPermission="canViewProduto">
                  <Produto />
                </PermissionRoute>
              } />
              
              {/* Consulta */}
              <Route path="consulta" element={
                <PermissionRoute requiredPermission="canViewConsulta">
                  <Consulta />
                </PermissionRoute>
              } />
              
              {/* Movimentação */}
              <Route path="movimentacao" element={
                <PermissionRoute requiredPermission="canViewMovimentacao">
                  <Movimentacao />
                </PermissionRoute>
              } />
              
              {/* Separação */}
              <Route path="separacao" element={
                <PermissionRoute requiredPermission="canViewSeparacao">
                  <Separacao />
                </PermissionRoute>
              } />
              
              {/* Ocorrências */}
              <Route path="ocorrencias" element={
                <PermissionRoute requiredPermission="canViewOcorrencia">
                  <Ocorrencias />
                </PermissionRoute>
              } />
              <Route path="NovaOcorrencia" element={
                <PermissionRoute requiredPermission="canAddOcorrencia">
                  <NovaOcorrencia />
                </PermissionRoute>
              } />
              
              {/* Auditoria */}
              <Route path="Auditoria" element={
                <PermissionRoute requiredPermission="canViewAuditoria">
                  <Auditoria />
                </PermissionRoute>
              } />
              <Route path="ConferenciaAudi/:id" element={
                <PermissionRoute requiredPermission="canViewAuditoria">
                  <ConferenciaAudi />
                </PermissionRoute>
              } />
              
              {/* Relatório */}
              <Route path="Relatorio" element={
                <PermissionRoute requiredPermission="canViewRelatorio">
                  <Relatorio />
                </PermissionRoute>
              } />

              {/* Usuários */}
              <Route path="usuarios" element={
                <PermissionRoute requiredPermission="canViewUsuario">
                  <Usuarios />
                </PermissionRoute>
              } />
              <Route path="criarusuario" element={
                <PermissionRoute requiredPermission="canAddUsuario">
                  <CriarUsuario />
                </PermissionRoute>
              } />
              
              {/* Perfis de Usuário */}
              <Route path="perfil-usuario" element={
                <PermissionRoute requiredPermission="canViewPerfil">
                  <PerfilUsuario />
                </PermissionRoute>
              } />
              <Route path="perfil-usuario/criar" element={
                <PermissionRoute requiredPermission="canAddPerfil">
                  <CriarPerfilUsuario />
                </PermissionRoute>
              } />
              <Route path="perfil-usuario/editar" element={
                <PermissionRoute requiredPermission="canEditPerfil">
                  <CriarPerfilUsuario />
                </PermissionRoute>
              } />

              {/* Redirecionamento padrão para dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Redirecionamentos para rotas não encontradas */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
