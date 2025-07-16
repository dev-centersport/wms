import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo'; // 1. Importe o registerRootComponent

import Login from './src/screens/login';
import Home from './src/screens/home';
import Movimentacao from './src/screens/movimentacao';
import Consulta from './src/screens/consulta';
import Ocorrencia from './src/screens/ocorrencia';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen
          name="Movimentacao"
          component={Movimentacao}
          options={{ headerShown: false }} // desativa o cabeçalho com seta
        />
        <Stack.Screen
          name="Consulta"
          component={Consulta}
          options={{ headerShown: false }} // <- isso desativa a seta e o título automáticos
        />
        <Stack.Screen
          name="Ocorrencia"
          component={Ocorrencia}
          options={{ headerShown: false }} // Desativa o cabeçalho automático com seta
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 2. Registre o componente App como o componente raiz
registerRootComponent(App);
