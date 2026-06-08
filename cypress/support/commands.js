// ***********************************************
// Comandos personalizados reutilizables de Cypress
// para el sistema GestorAcadémico
// ***********************************************

/**
 * Comando: cy.mockSupabaseAuth()
 * Intercepta todas las llamadas de autenticación de Supabase
 * y simula un usuario autenticado, permitiendo navegar
 * la aplicación sin depender del backend real.
 */
Cypress.Commands.add('mockSupabaseAuth', () => {
  const fakeUser = {
    id: 'test-user-id-123',
    email: 'test@espe.edu.ec',
    user_metadata: { name: 'Estudiante Test' },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
  };

  const fakeSession = {
    access_token: 'fake-access-token-for-testing',
    refresh_token: 'fake-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: fakeUser,
  };

  // Interceptar la verificación de sesión de Supabase
  cy.intercept('GET', '**/auth/v1/user', {
    statusCode: 200,
    body: fakeUser,
  }).as('getUser');

  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 200,
    body: fakeSession,
  }).as('getToken');

  // Interceptar llamada getSession
  cy.intercept('GET', '**/rest/v1/**', {
    statusCode: 200,
    body: [],
  }).as('getRestData');

  cy.intercept('POST', '**/rest/v1/**', {
    statusCode: 201,
    body: [{}],
  }).as('postRestData');

  cy.intercept('PATCH', '**/rest/v1/**', {
    statusCode: 200,
    body: [{}],
  }).as('patchRestData');

  cy.intercept('DELETE', '**/rest/v1/**', {
    statusCode: 200,
    body: [],
  }).as('deleteRestData');

  // Simular la sesión en localStorage (formato Supabase v2)
  const storageKey = `sb-yaiynnuupdcltwfvbgvd-auth-token`;
  window.localStorage.setItem(storageKey, JSON.stringify({
    currentSession: fakeSession,
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  }));
});

/**
 * Comando: cy.loginMock()
 * Simula un login exitoso configurando el localStorage
 * y visitando la página principal.
 */
Cypress.Commands.add('loginMock', () => {
  cy.mockSupabaseAuth();
  cy.visit('/');
});

/**
 * Comando: cy.setupLocalStorageData(key, data)
 * Configura datos en el localStorage para simular
 * estado previo (materias, tareas, etc.)
 */
Cypress.Commands.add('setupLocalStorageData', (key, data) => {
  window.localStorage.setItem(key, JSON.stringify(data));
});
