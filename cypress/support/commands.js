// ***********************************************
// Comandos personalizados reutilizables de Cypress
// para el sistema GestorAcadémico
// ***********************************************

Cypress.Commands.add('loginMock', () => {
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

  // 1. Interceptar todas las llamadas de Supabase
  cy.intercept('GET', '**/auth/v1/user', { statusCode: 200, body: fakeUser }).as('getUser');
  cy.intercept('POST', '**/auth/v1/token*', { statusCode: 200, body: fakeSession }).as('getToken');
  cy.intercept('GET', '**/rest/v1/**', { statusCode: 200, body: [] }).as('getRestData');
  cy.intercept('POST', '**/rest/v1/**', { statusCode: 201, body: [{}] }).as('postRestData');
  cy.intercept('PATCH', '**/rest/v1/**', { statusCode: 200, body: [{}] }).as('patchRestData');
  cy.intercept('DELETE', '**/rest/v1/**', { statusCode: 200, body: [] }).as('deleteRestData');

  // 2. Realizar un login súper rápido a través de la UI. 
  // Al estar interceptado 'getToken', cualquier credencial será aceptada por nuestro mock.
  cy.visit('/login');
  cy.get('#email').type('test@espe.edu.ec', { delay: 0 }); // delay: 0 escribe instantáneamente
  cy.get('#password').type('TestPassword123!', { delay: 0 });
  cy.get('button[type="submit"]').click();

  // 3. Esperar a que el Router de la aplicación haga la transición
  // y confirme que ya NO estamos en la pantalla de login
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('setupLocalStorageData', (key, data) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, JSON.stringify(data));
  });
});