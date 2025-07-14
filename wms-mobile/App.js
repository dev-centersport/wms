import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';

import Login from './src/screens/login';
import Home from './src/screens/home';
import Movimentacao from './src/screens/movimentacao';
import Consulta from './src/screens/consulta'; // ✅ Nome corrigido

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Movimentacao" component={Movimentacao} />
        <Stack.Screen name="Consulta" component={Consulta} /> {/* ✅ Nome da tela correto */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);
