/// <reference types="cypress" />

describe('Flujos de Usuario en Versión Móvil', () => {
  beforeEach(() => {
    // Forzar viewport móvil para todas las pruebas de este archivo
    cy.viewport(360, 800);
    
    // Interceptores base para peticiones
    cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');
    cy.intercept('POST', '**/auth/v1/signup*').as('signupRequest');
    cy.intercept('POST', '**/auth/v1/logout*').as('logoutRequest');
  });

  describe('Navegación e Interfaz Móvil', () => {
    it('TC-MOBILE-01: Debe renderizar la barra de navegación en el borde inferior', () => {
      cy.loginMock();
      cy.get('nav').should('be.visible');
      cy.get('nav').should('have.class', 'fixed').and('have.class', 'bottom-0');
    });

    it('TC-MOBILE-02: Las etiquetas de texto de la barra de navegación deben estar ocultas', () => {
      cy.loginMock();
      // En mobile, el texto de los ítems de navegación tiene la clase hidden md:inline
      // Por ende, en un viewport de 360px no deben ser visibles
      cy.get('nav a span').should('not.be.visible');
    });

    it('TC-MOBILE-03: Debe navegar a las diferentes secciones usando la barra inferior', () => {
      cy.loginMock();
      
      // Ir a la sección de Tareas (segundo enlace)
      cy.get('nav a[href="/tasks"]').first().click();
      cy.url().should('include', '/tasks');
      cy.contains('Tareas').should('be.visible');

      // Ir a la sección de Apuntes (sexto enlace)
      cy.get('nav a[href="/notes"]').first().click();
      cy.url().should('include', '/notes');
      cy.contains('Apuntes').should('be.visible');
    });
  });

  describe('Flujo de Cierre de Sesión en Móvil', () => {
    it('TC-MOBILE-04: Debe permitir al usuario cerrar sesión desde la página de perfil', () => {
      cy.loginMock();
      
      // Ir a la sección de Perfil
      cy.get('nav a[href="/profile"]').first().click();
      cy.url().should('include', '/profile');
      cy.contains('Perfil del Estudiante').should('be.visible');

      // Buscar el botón de Cerrar Sesión específico para móvil/perfil
      cy.get('#logout-button').should('be.visible').click();

      // Debería redirigir al login
      cy.url().should('include', '/login');
      cy.contains('Iniciar sesión').should('be.visible');
    });
  });
});
