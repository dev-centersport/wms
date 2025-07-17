import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';
import * as Updates from 'expo-updates';

const Stack = createNativeStackNavigator();

function App() {
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
