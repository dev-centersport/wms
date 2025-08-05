/**
 * Sistema de cores moderno para o WMS Mobile
 * Mantém a identidade visual verde com variações e gradientes
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Cores principais do WMS
const primaryGreen = '#61DE25';
const primaryGreenDark = '#4BCC1C';
const primaryGreenLight = '#7FE34A';
const accentBlue = '#0a7ea4';
const accentBlueLight = '#1a8bb4';

export const Colors = {
  light: {
    // Cores principais
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    
    // Cores do WMS
    primary: primaryGreen,
    primaryDark: primaryGreenDark,
    primaryLight: primaryGreenLight,
    accent: accentBlue,
    accentLight: accentBlueLight,
    
    // Cores de interface
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',
    border: '#E1E5E9',
    borderLight: '#F0F2F5',
    
    // Cores de estado
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Cores de texto
    textPrimary: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',
    textInverse: '#FFFFFF',
    
    // Cores de input
    inputBackground: '#F8F9FA',
    inputBorder: '#E1E5E9',
    inputFocus: primaryGreen,
    placeholder: '#9BA1A6',
    
    // Cores de botões
    buttonPrimary: primaryGreen,
    buttonSecondary: '#F8F9FA',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#11181C',
    
    // Cores de cards
    cardBackground: '#FFFFFF',
    cardBorder: '#E1E5E9',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Cores principais
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    
    // Cores do WMS (versão dark)
    primary: primaryGreenLight,
    primaryDark: primaryGreen,
    primaryLight: '#8FE55A',
    accent: accentBlueLight,
    accentLight: '#2A9BC4',
    
    // Cores de interface
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    border: '#404040',
    borderLight: '#333333',
    
    // Cores de estado
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Cores de texto
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#687076',
    textInverse: '#151718',
    
    // Cores de input
    inputBackground: '#2A2A2A',
    inputBorder: '#404040',
    inputFocus: primaryGreenLight,
    placeholder: '#687076',
    
    // Cores de botões
    buttonPrimary: primaryGreenLight,
    buttonSecondary: '#2A2A2A',
    buttonText: '#151718',
    buttonTextSecondary: '#ECEDEE',
    
    // Cores de cards
    cardBackground: '#1E1E1E',
    cardBorder: '#404040',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Gradientes modernos
export const Gradients = {
  primary: ['#61DE25', '#4BCC1C'],
  primaryLight: ['#7FE34A', '#61DE25'],
  accent: ['#0a7ea4', '#1a8bb4'],
  surface: ['#FFFFFF', '#F8F9FA'],
  surfaceDark: ['#1E1E1E', '#2A2A2A'],
};

// Sombras modernas
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Bordas arredondadas
export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

// Espaçamentos
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
