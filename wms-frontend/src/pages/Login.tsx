import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  styled
} from "@mui/material";
import logo from "../img/image.png";
import { useAuth } from '../contexts/AuthContext';

// -------- Styled Components --------
const StyledLoginContainer = styled(Box)({
  backgroundColor: "rgb(97, 222, 37)",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

const StyledLoginCard = styled(Box)({
  backgroundColor: "transparent",
  padding: "3rem",
  borderRadius: "18px",
  width: "590px",
  border: "3px solid white",
  textAlign: "center"
});

const StyledLogoContainer = styled(Box)({
  backgroundColor: "rgb(97, 222, 37)",
  marginBottom: "1.5rem"
});

const StyledLogo = styled("img")({
  width: "80%",
  height: "80%",
  objectFit: "contain"
});

const StyledButton = styled(Button)({
  width: "100%",
  padding: "1rem",
  backgroundColor: "#1e1e1e",
  color: "white",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "1rem",
  marginBottom: "30px",
  "&:hover": {
    backgroundColor: "#000000ff"
  }
});

// -------- Componente Login --------
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!usuario.trim() || !senha.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const resultado = await login(usuario, senha);

      if (resultado.status === 200) {
        console.log('Login realizado com sucesso!');
        // O redirecionamento será feito automaticamente pelo AuthContext
      } else {
        alert(`${resultado.message}`);
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      alert('Erro inesperado ao tentar login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <StyledLoginContainer>
      <StyledLoginCard>
        <StyledLogoContainer>
          <StyledLogo src={logo} alt="Logo WMS" />
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
            Bem Vindo!
          </Typography>
        </StyledLogoContainer>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <FaUser color="rgba(0, 0, 0, 1)" />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "10px",
                "& fieldset": {
                  border: "none"
                }
              }
            }}
          />

          <TextField
            label="Senha"
            variant="outlined"
            fullWidth
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    edge="end"
                    disabled={loading}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <FaEyeSlash color="rgba(0, 0, 0, 1)" />
                    ) : (
                      <FaEye color="rgba(0, 0, 0, 1)" />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "10px",
                "& fieldset": {
                  border: "none"
                }
              }
            }}
          />

          <StyledButton 
            variant="contained" 
            onClick={handleLogin} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </StyledButton>
        </form>

        <Typography
          variant="body1"
          sx={{
            fontStyle: "italic",
            fontWeight: "bold",
            fontSize: "1.02rem",
            mb: -2.5
          }}
        >
          "Otimizando a gestão de armazém com tecnologia eficiente"
        </Typography>
      </StyledLoginCard>
    </StyledLoginContainer>
  );
};

export default Login
