import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import logo from "../img/image.png"

const IconUser = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = () => {
    navigate("/armazem");
  };

  return (
    <div style={{
      backgroundColor: "#55F136",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "transparent",
        padding: "3rem",
        borderRadius: "18px",
        width: "400px",
        border: "3px solid white",
        textAlign: "center"
      }}>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            backgroundColor: "#55F136",
            borderRadius: "50%",
            width: "150px",
            height: "150px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(0, 0, 0, 0.3)"
          }}>
            <img src={logo} alt="Logo WMS" style={{ width: "100px", height: "100px" }} />
          </div>
          <h2 style={{
            margin: "15px 0 5px",
            fontWeight: "bold",
            fontSize: "32px"
          }}>WMS</h2>
          <p style={{ fontSize: "16px" }}>Bem Vindo!</p>
        </div>

        <div style={{ marginBottom: "1rem", textAlign: "left" }}>
          <label style={{ fontWeight: "bold" }}>Usuário</label>
          <div style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: "10px",
            marginTop: "5px"
          }}>
            <div style={{ padding: "0.75rem" }}>
              <IconUser color="#55F136" />
            </div>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                padding: "0.75rem",
                background: "transparent",
                fontSize: "1rem"
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <label style={{ fontWeight: "bold" }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              fontSize: "1rem",
              marginTop: "5px"
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem"
          }}
        >
          Entrar
        </button>

        <p style={{
          marginTop: "1.5rem",
          fontStyle: "italic",
          fontSize: "0.9rem"
        }}>
          "Otimizando a gestão de armazém com tecnologia eficiente"
        </p>
      </div>
    </div>
  );
};

export default Login;
