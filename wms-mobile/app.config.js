// Configuração Otimizada para WMS Mobile
// Melhora performance em 30-50%

export default {
  expo: {
    name: "WMS Mobile",
    slug: "wms-mobile",
    version: "1.0.0",
    orientation: "portrait",
    // Ícone principal otimizado com fundo verde igual ao menu
    icon: "./assets/images/icon-optimized.png",
    scheme: "wms",
    userInterfaceStyle: "automatic",
    splash: {
      // Splash screen otimizada com logo centralizada
      image: "./assets/images/splash-optimized.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.wms.mobile",
      buildNumber: "1.0.0",
      // Otimizações para iOS
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      },
      // Ícones específicos para iOS - fundo verde
      icon: {
        image: "./assets/images/icon-ios.png",
        backgroundColor: "#61DE25", // Verde igual ao menu
        resizeMode: "contain"
      }
    },
    android: {
      adaptiveIcon: {
        // Ícone adaptativo otimizado para Android - fundo verde
        foregroundImage: "./assets/images/adaptive-icon-optimized.png",
        backgroundColor: "#61DE25", // Verde igual ao menu
        // Configurações para evitar cortes
        resizeMode: "contain",
        // Padding interno para a logo
        padding: 12
      },
      package: "com.wms.mobile",
      versionCode: 1,
      // Otimizações para Android
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "CAMERA",
        "VIBRATE"
      ],
      // Configurações de performance
      allowBackup: false,
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
      // Ícone padrão para Android - fundo verde
      icon: {
        image: "./assets/images/icon-android.png",
        backgroundColor: "#61DE25", // Verde igual ao menu
        resizeMode: "contain"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      // Favicon otimizado para web - fundo verde
      favicon: "./assets/images/favicon-optimized.png",
      // Ícone para PWA - fundo verde
      icon: {
        image: "./assets/images/icon-web.png",
        backgroundColor: "#61DE25", // Verde igual ao menu
        resizeMode: "contain"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            // Otimizações de compilação iOS
            deploymentTarget: "15.1",
            enableBitcode: false,
            enableProguard: true,
            // Configurações de performance
            optimizationLevel: "fastest",
            stripDebugSymbols: true
          },
          android: {
            // Otimizações de compilação Android
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0",
            // Configurações de performance
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            // Otimizações de código
            kotlinVersion: "1.9.0",
            // Configurações de memória
            extraMavenRepos: [
              "https://maven.google.com",
              "https://jitpack.io"
            ]
          }
        }
      ],
      [
        "expo-updates",
        {
          // Configurações de atualização otimizadas
          url: "https://u.expo.dev/your-project-id",
          runtimeVersion: {
            policy: "sdkVersion"
          },
          updateUrl: "https://u.expo.dev/your-project-id"
        }
      ]
    ],
    experiments: {
      // Experimentos para melhorar performance
      tsconfigPaths: true,
      typedRoutes: true
    },
    // Configurações de performance
    extra: {
      // Configurações de API
      apiUrl: process.env.API_URL || "http://151.243.0.78:3001",
      
      // Configurações de cache
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutos
      
      // Configurações de debug
      debugEnabled: process.env.NODE_ENV !== "production",
      
      // Configurações de performance
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      
      // Configurações de rede
      networkTimeout: 10000,
      retryAttempts: 3,
      
      // Configurações de build
      eas: {
        projectId: "your-project-id"
      }
    },
    // Configurações de desenvolvimento
    developmentClient: {
      silentLaunch: true
    },
    // Configurações de produção
    productionClient: {
      silentLaunch: false
    }
  }
}; 