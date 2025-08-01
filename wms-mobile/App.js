import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import * as Updates from "expo-updates";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import Loading from "./src/components/Loading";

import Login from "./src/screens/login";
import Home from "./src/screens/home";
import Movimentacao from "./src/screens/movimentacao";
import Consulta from "./src/screens/consulta";
import Ocorrencia from "./src/screens/ocorrencia";

const Stack = createNativeStackNavigator();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	if (!isAuthenticated) {
		return <Login />;
	}

	return children;
};

// Componente para rotas públicas (como login)
const PublicRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	if (isAuthenticated) {
		return <Home />; // Redireciona para Home após login
	}

	return children;
};

const AppNavigator = () => {
	const { isAuthenticated, loading } = useAuth();

	useEffect(() => {
		async function checkUpdate() {
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				await Updates.fetchUpdateAsync();
				await Updates.reloadAsync();
			}
		}

		checkUpdate();
	}, []);

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
				<Stack.Screen
					name="Login"
					component={PublicRoute}
					options={{ headerShown: false }}
				>
					{() => <Login />}
				</Stack.Screen>

				<Stack.Screen
					name="Home"
					component={ProtectedRoute}
					options={{ headerShown: false }}
				>
					{() => <Home />}
				</Stack.Screen>

				<Stack.Screen
					name="Movimentacao"
					component={ProtectedRoute}
					options={{ headerShown: false }}
				>
					{() => <Movimentacao />}
				</Stack.Screen>

				<Stack.Screen
					name="Consulta"
					component={ProtectedRoute}
					options={{ headerShown: false }}
				>
					{() => <Consulta />}
				</Stack.Screen>

				<Stack.Screen
					name="Ocorrencia"
					component={ProtectedRoute}
					options={{ headerShown: false }}
				>
					{() => <Ocorrencia />}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

function App() {
	return (
		<AuthProvider>
			<AppNavigator />
		</AuthProvider>
	);
}

// Registre o componente App como o componente raiz
registerRootComponent(App);
