import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

// Páginas principais
import Armazem from "./pages/Armazem";
import Login from "./pages/Login";
import Localizacao from "./pages/Localizacao"

const container = document.getElementById("root");

if (!container) {
  throw new Error("Elemento root não encontrado no HTML.");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/armazem" element={<Armazem />} />
        <Route path="/login" element={<Login />} />
        <Route path="/localizacao" element={<Localizacao />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
