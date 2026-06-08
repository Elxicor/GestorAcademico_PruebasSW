// ***********************************************************
// Archivo de soporte global de Cypress para GestorAcadémico
// Se ejecuta antes de cada archivo de especificación.
// ***********************************************************

import './commands';

// Suprimir errores no capturados de la aplicación React
// para evitar que fallen los tests por errores de renderizado
Cypress.on('uncaught:exception', (err) => {
  // Ignorar errores de Supabase y de red
  if (err.message.includes('Missing Supabase') ||
      err.message.includes('fetch') ||
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('supabase')) {
    return false;
  }
  return true;
});
