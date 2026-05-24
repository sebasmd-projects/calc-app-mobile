import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      appName: 'CalcPro',
      
      // Navigation
      calculator: 'Calculator',
      graphs: 'Graphs',
      converter: 'Converter',
      matrixCas: 'Matrix / CAS',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      logout: 'Logout',
      
      // Auth
      welcomeBack: 'Welcome Back',
      createAccount: 'Create an Account',
      signInSubtitle: 'Sign in to sync your calculator history',
      registerSubtitle: 'Register to save your calculations',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      keepMeSignedIn: 'Keep me signed in',
      accessCalculator: 'Access Calculator',
      registerAccess: 'Register & Access',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      registerHere: 'Register here',
      signInHere: 'Sign in here',
      
      // Calculator
      rad: 'RAD',
      deg: 'DEG',
      clear: 'Clear',
      delete: 'Delete',
      equals: 'Equals',
      
      // Graph
      functionInput: 'f(x) =',
      from: 'From',
      to: 'To',
      plotFunction: 'Plot Function',
      
      // Converter
      unitConverter: 'Unit Converter',
      length: 'Length',
      mass: 'Mass',
      temperature: 'Temperature',
      data: 'Data',
      swap: 'Swap',
      
      // Matrix/CAS
      symbolicCas: 'Symbolic CAS',
      matrixOperations: 'Matrix Operations',
      casAlgebra: 'CAS / Algebra',
      matrices: 'Matrices',
      simplify: 'Simplify',
      derivative: 'Derivative d/dx',
      evaluate: 'Evaluate',
      matrixA: 'Matrix A',
      matrixB: 'Matrix B',
      multiplyAB: 'Multiply (A × B)',
      addAB: 'Add (A + B)',
      determinant: 'Determinant (det A)',
      inverse: 'Inverse (A⁻¹)',
      calculate: 'Calculate',
      result: 'Result',
      
      // History
      history: 'History',
      noHistory: 'No history yet',
      clearHistory: 'Clear History',
      
      // Placeholders
      enterExpression: 'e.g. 2x + x, x^2 + 2x, sin(2x)',
      matrixPlaceholder: '[[1, 2], [3, 4]]',
      
      // Errors
      invalidExpression: 'Invalid expression',
      invalidMatrices: 'Invalid matrices or operation',
      error: 'Error',
      
      // Loading
      loading: 'Loading...',
    },
  },
  es: {
    translation: {
      // App
      appName: 'CalcPro',
      
      // Navigation
      calculator: 'Calculadora',
      graphs: 'Graficos',
      converter: 'Convertidor',
      matrixCas: 'Matriz / CAS',
      darkMode: 'Modo Oscuro',
      lightMode: 'Modo Claro',
      language: 'Idioma',
      logout: 'Cerrar Sesion',
      
      // Auth
      welcomeBack: 'Bienvenido',
      createAccount: 'Crear una Cuenta',
      signInSubtitle: 'Inicia sesión para sincronizar tu historial',
      registerSubtitle: 'Regístrate para guardar tus cálculos',
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      keepMeSignedIn: 'Mantener sesión iniciada',
      accessCalculator: 'Acceder a Calculadora',
      registerAccess: 'Registrar y Acceder',
      noAccount: '¿No tienes una cuenta?',
      haveAccount: '¿Ya tienes una cuenta?',
      registerHere: 'Regístrate aquí',
      signInHere: 'Inicia sesión aquí',
      
      // Calculator
      rad: 'RAD',
      deg: 'DEG',
      clear: 'Limpiar',
      delete: 'Borrar',
      equals: 'Igual',
      
      // Graph
      functionInput: 'f(x) =',
      from: 'Desde',
      to: 'Hasta',
      plotFunction: 'Graficar Función',
      
      // Converter
      unitConverter: 'Convertidor de Unidades',
      length: 'Longitud',
      mass: 'Masa',
      temperature: 'Temperatura',
      data: 'Datos',
      swap: 'Intercambiar',
      
      // Matrix/CAS
      symbolicCas: 'CAS Simbólico',
      matrixOperations: 'Operaciones de Matriz',
      casAlgebra: 'CAS / Álgebra',
      matrices: 'Matrices',
      simplify: 'Simplificar',
      derivative: 'Derivada d/dx',
      evaluate: 'Evaluar',
      matrixA: 'Matriz A',
      matrixB: 'Matriz B',
      multiplyAB: 'Multiplicar (A × B)',
      addAB: 'Sumar (A + B)',
      determinant: 'Determinante (det A)',
      inverse: 'Inversa (A⁻¹)',
      calculate: 'Calcular',
      result: 'Resultado',
      
      // History
      history: 'Historial',
      noHistory: 'Sin historial aun',
      clearHistory: 'Limpiar Historial',
      
      // Placeholders
      enterExpression: 'ej. 2x + x, x^2 + 2x, sin(2x)',
      matrixPlaceholder: '[[1, 2], [3, 4]]',
      
      // Errors
      invalidExpression: 'Expresión inválida',
      invalidMatrices: 'Matrices u operación inválida',
      error: 'Error',
      
      // Loading
      loading: 'Cargando...',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
