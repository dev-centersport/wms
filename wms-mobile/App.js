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

// Componente para verificar autenticação
const AuthCheck = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	return children;
};

const AppNavigator = () => {
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		async function checkUpdate() {
			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
					await Updates.reloadAsync();
				}
			} catch (error) {
				console.log("Erro ao verificar atualizações:", error);
			}
		}

		checkUpdate();
	}, []);

	return (
		<NavigationContainer>
			<Stack.Navigator
				initialRouteName={isAuthenticated ? "Home" : "Login"}
				screenOptions={{ headerShown: false }}
			>
				{!isAuthenticated ? (
					<Stack.Screen name="Login" component={Login} />
				) : (
					<>
						<Stack.Screen name="Home" component={Home} />
						<Stack.Screen name="Movimentacao" component={Movimentacao} />
						<Stack.Screen name="Consulta" component={Consulta} />
						<Stack.Screen name="Ocorrencia" component={Ocorrencia} />
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

function App() {
	return (
		<AuthProvider>
			<AuthCheck>
				<AppNavigator />
			</AuthCheck>
		</AuthProvider>
	);
}

// Registre o componente App como o componente raiz
registerRootComponent(App);
