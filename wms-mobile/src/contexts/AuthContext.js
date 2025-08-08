import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setLogoutCallback, clearLogoutCallback } from "../api/config";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Verifica se há um token válido ao inicializar
	useEffect(() => {
		checkAuth();

		// Configura o callback de logout para redirecionar automaticamente
		setLogoutCallback(() => {
			console.log("🔄 Logout automático devido a erro 401");
			setUser(null);
		});

		// Limpa o callback quando o componente for desmontado
		return () => {
			clearLogoutCallback();
		};
	}, []);

	const checkAuth = async () => {
		try {
			const token = await AsyncStorage.getItem("token");

			if (token) {
				try {
					// Tenta buscar o perfil do usuário para verificar se o token é válido
					const response = await api.get("/auth/profile");
					setUser({
						usuario_id: response.data.usuario_id,
						usuario: response.data.usuario,
						nivel: response.data.nivel || 1,
						perfil: response.data.perfil,
					});
				} catch (error) {
					// Se der erro 401, limpa o token
					console.log("Token inválido, fazendo logout automático");
					await AsyncStorage.removeItem("token");
					setUser(null);
				}
			}
		} catch (error) {
			console.error("Erro ao verificar autenticação:", error);
		} finally {
			setLoading(false);
		}
	};

	const login = async (usuario, senha) => {
		try {
			const response = await api.post("/auth/login", { usuario, senha });

			if (response.data.access_token) {
				await AsyncStorage.setItem("token", response.data.access_token);

				setUser({
					usuario_id: response.data.usuario_id,
					usuario: response.data.usuario,
					nivel: response.data.nivel,
					perfil: response.data.perfil,
				});

				return { success: true, message: "Login realizado com sucesso!" };
			} else {
				return { success: false, message: "Usuário ou senha inválidos" };
			}
		} catch (error) {
			if (error.response?.data?.message) {
				return { success: false, message: error.response.data.message };
			}
			return { success: false, message: "Erro inesperado ao tentar login." };
		}
	};

	const logout = async () => {
		try {
			// Chama o endpoint de logout no backend para limpar o token no banco
			await api.post("/auth/logout");
		} catch (error) {
			console.log("Erro ao fazer logout no backend:", error);
		} finally {
			// Sempre limpa o token local e o estado do usuário
			await AsyncStorage.removeItem("token");
			setUser(null);
		}
	};

	const value = {
		user,
		isAuthenticated: !!user,
		login,
		logout,
		loading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
