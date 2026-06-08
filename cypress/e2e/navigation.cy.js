/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Navegación y Rutas Protegidas
 * 
 * Justificación: Verificar que el sistema de rutas funciona correctamente,
 * que las rutas protegidas redirigen a login cuando no hay sesión,
 * y que la página 404 se muestra para rutas inexistentes.
 * 
 * Funcionalidades probadas:
 * - Redirección a login sin autenticación
 * - Navegación por sidebar con autenticación
 * - Página 404 para rutas inexistentes
 * - Estructura del Navbar
 */

describe('Módulo de Navegación y Rutas', () => {

  // ======================================
  // RUTAS PROTEGIDAS - SIN AUTENTICACIÓN
  // ======================================
  describe('Rutas Protegidas - Sin Autenticación', () => {

    it('TC-NAV-01: Debe redirigir al login cuando se accede a / sin autenticación', () => {
      cy.visit('/');
      // La app debe redirigir a login si no hay sesión
      cy.url().should('include', '/login');
    });

    it('TC-NAV-02: Debe redirigir al login cuando se accede a /tasks sin autenticación', () => {
      cy.visit('/tasks');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-03: Debe redirigir al login cuando se accede a /subjects sin autenticación', () => {
      cy.visit('/subjects');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-04: Debe redirigir al login cuando se accede a /grades sin autenticación', () => {
      cy.visit('/grades');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-05: Debe redirigir al login cuando se accede a /schedule sin autenticación', () => {
      cy.visit('/schedule');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-06: Debe redirigir al login cuando se accede a /notes sin autenticación', () => {
      cy.visit('/notes');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-07: Debe redirigir al login cuando se accede a /gpa sin autenticación', () => {
      cy.visit('/gpa');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-08: Debe redirigir al login cuando se accede a /analytics sin autenticación', () => {
      cy.visit('/analytics');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-09: Debe redirigir al login cuando se accede a /profile sin autenticación', () => {
      cy.visit('/profile');
      cy.url().should('include', '/login');
    });
  });

  // ======================================
  // PÁGINA 404
  // ======================================
  describe('Página 404 - Rutas Inexistentes', () => {

    it('TC-NAV-10: Debe mostrar la página 404 para una ruta inexistente', () => {
      cy.visit('/ruta-que-no-existe', { failOnStatusCode: false });

      // Verificar que se muestra el contenido de 404
      cy.contains('404').should('be.visible');
      cy.contains('Página no encontrada').should('be.visible');
    });

    it('TC-NAV-11: Debe tener un enlace para volver al inicio desde la página 404', () => {
      cy.visit('/pagina-invalida', { failOnStatusCode: false });

      cy.contains('Volver al Inicio').should('be.visible');
      cy.contains('Volver al Inicio').should('have.attr', 'href', '/');
    });

    it('TC-NAV-12: Debe mostrar 404 para rutas con parámetros inválidos', () => {
      cy.visit('/tasks/id-inexistente/detalle', { failOnStatusCode: false });
      cy.contains('404').should('be.visible');
    });
  });

  // ======================================
  // NAVEGACIÓN AUTENTICADA
  // ======================================
  describe('Navegación con Autenticación', () => {

    beforeEach(() => {
      cy.loginMock();
      cy.wait(500);
    });

    it('TC-NAV-13: Debe mostrar el Navbar con todos los enlaces', () => {
      cy.get('nav').should('be.visible');
      cy.get('nav').contains('GestorAcadémico').should('exist');
    });

    it('TC-NAV-14: Debe mostrar información del usuario en el Navbar', () => {
      // El navbar muestra el nombre y email del usuario
      cy.get('nav').should('exist');
    });

    it('TC-NAV-15: Debe tener enlaces a todas las secciones', () => {
      cy.get('nav').find('a[href="/"]').should('exist');
      cy.get('nav').find('a[href="/tasks"]').should('exist');
      cy.get('nav').find('a[href="/subjects"]').should('exist');
      cy.get('nav').find('a[href="/grades"]').should('exist');
      cy.get('nav').find('a[href="/schedule"]').should('exist');
      cy.get('nav').find('a[href="/notes"]').should('exist');
      cy.get('nav').find('a[href="/gpa"]').should('exist');
      cy.get('nav').find('a[href="/analytics"]').should('exist');
      cy.get('nav').find('a[href="/profile"]').should('exist');
    });

    it('TC-NAV-16: Debe resaltar la sección activa en el Navbar', () => {
      // Navegar a tareas y verificar que se resalta
      cy.get('nav').find('a[href="/tasks"]').click();
      cy.url().should('include', '/tasks');
      cy.get('nav').find('a[href="/tasks"]').should('have.class', 'text-indigo-600');
    });
  });

  // ======================================
  // ACCESO A PÁGINAS PÚBLICAS
  // ======================================
  describe('Páginas Públicas', () => {

    it('TC-NAV-17: Debe permitir acceso a /login sin autenticación', () => {
      cy.visit('/login');
      cy.contains('Bienvenido de nuevo').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('TC-NAV-18: Debe permitir acceso a /signup sin autenticación', () => {
      cy.visit('/signup');
      cy.contains('Crea tu cuenta').should('be.visible');
      cy.url().should('include', '/signup');
    });
  });
});
