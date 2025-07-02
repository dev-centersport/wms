import React from "react";
import { useNavigate } from "react-router-dom";
import { buscarLocalizacoes, Localizacao} from "../services/API";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/armazem");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
