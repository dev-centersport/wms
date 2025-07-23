import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Você precisará criar este componente
import './App.css';

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet /> {/* Isso renderizará as rotas filhas */}
      </main>
    </div>
  );
}

export default App;