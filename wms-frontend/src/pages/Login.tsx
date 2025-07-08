import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../img/image.png";

const IconUser = FaUser as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const IconEye = FaEye as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const IconEyeSlash = FaEyeSlash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = () => {
    navigate("/armazem");
  };

  return (
    <div style={{
      backgroundColor: "rgb(97, 222, 37)",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "transparent",
        padding: "3rem",
        borderRadius: "18px",
        width: "590px",
        border: "3px solid white",
        textAlign: "center"
      }}>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            backgroundColor: "rgb(97, 222, 37)",
          }}>
            <img
              src={logo}
              alt="Logo WMS"
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain"
              }}
            />
          </div>
          <h2 style={{
            margin: "15px 0 0px",
            fontWeight: "bold",
            fontSize: "32px"
          }}></h2>
          <p style={{ fontSize: "23px", fontWeight: "bold", marginTop: -20 }}>Bem Vindo!</p>
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
              <IconUser color="rgb(97, 222, 37)" />
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
          <div style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: "10px",
            marginTop: "5px"
          }}>
            <input
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                padding: "0.75rem",
                background: "transparent",
                fontSize: "1rem"
              }}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                border: "none",
                background: "transparent",
                padding: "0.75rem",
                cursor: "pointer"
              }}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? (
                <IconEyeSlash color="rgb(97, 222, 37)" style={{ fontSize: "1.25rem" }} />
              ) : (
                <IconEye color="rgb(97, 222, 37)" style={{ fontSize: "1.25rem" }} />
              )}
            </button>

          </div>
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
            fontSize: "1rem",
            marginBottom: "30px"
          }}
        >
          Entrar
        </button>

        <p style={{
          marginBottom: -20,
          fontStyle: "italic",
          fontWeight: "bold",
          fontSize: "1.02rem"
        }}>
          "Otimizando a gestão de armazém com tecnologia eficiente"
        </p>
      </div>
    </div>
  );
};

export default Login;
