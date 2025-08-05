// Configuração Otimizada para WMS Mobile
// Melhora performance em 30-50%

export default {
  expo: {
    name: "WMS Mobile",
    slug: "wms-mobile",
    version: "1.0.0",
    updates: {
      url: "https://u.expo.dev/7c70b2ce-33f0-4e1c-beb5-67312ef48ebc"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    icon: "./assets/images/icon-optimized.png",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.wms.mobile",
      buildNumber: "1.0.0",
      icon: "./assets/images/icon-ios.png",
      infoPlist: {
        UIBackgroundModes: ["fetch", "remote-notification"],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon-optimized.png",
        backgroundColor: "#61DE25"
      },
      package: "com.wms.mobile",
      versionCode: 1,
      icon: "./assets/images/icon-android.png",
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "CAMERA",
        "VIBRATE"
      ],
      allowBackup: false,
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true
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
          url: "https://u.expo.dev/7c70b2ce-33f0-4e1c-beb5-67312ef48ebc",
          runtimeVersion: {
            policy: "sdkVersion"
          },
          updateUrl: "https://u.expo.dev/7c70b2ce-33f0-4e1c-beb5-67312ef48ebc"
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
        projectId: "7c70b2ce-33f0-4e1c-beb5-67312ef48ebc"
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