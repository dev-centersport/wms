import React from "react";
import Sidebar from '../components/Sidebar';

const Armazem: React.FC = () => {
  return (
    <>
      <Sidebar />
      <div style={{ padding: "2rem" }}>
        <h1>Armazém</h1>
        <p>Bem-vindo à tela de Armazém.</p>
      </div>
    </>
  );
};

export default Armazem;
