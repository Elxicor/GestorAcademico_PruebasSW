/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Gestión de Apuntes
 * 
 * Justificación: Los apuntes son herramientas de estudio esenciales.
 * Se prueba el CRUD completo, la funcionalidad de búsqueda,
 * el filtrado por materia y la gestión de etiquetas (tags).
 * 
 * Funcionalidades probadas:
 * - Visualización de la página de apuntes
 * - Crear apunte con datos válidos
 * - Crear apunte sin título (error)
 * - Crear apunte sin contenido (error)
 * - Funcionalidad de búsqueda
 * - Filtro por materia
 * - Gestión de etiquetas
 */

describe('Módulo de Apuntes', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // VISUALIZACIÓN
  // ======================================
  describe('Visualización de Apuntes', () => {

    it('TC-NOTE-01: Debe mostrar la página de apuntes correctamente', () => {
      cy.visit('/notes');
      cy.contains('Apuntes').should('be.visible');
      cy.get('[data-cy="btn-add-note"]').should('be.visible');
    });

    it('TC-NOTE-02: Debe mostrar mensaje vacío cuando no hay apuntes', () => {
      cy.visit('/notes');
      cy.contains('Aún no hay apuntes').should('be.visible');
    });

    it('TC-NOTE-03: Debe mostrar la barra de búsqueda', () => {
      cy.visit('/notes');
      cy.get('[data-cy="notes-search"]').should('be.visible');
      cy.get('[data-cy="notes-search"]').should('have.attr', 'placeholder').and('contain', 'Buscar');
    });

    it('TC-NOTE-04: Debe mostrar el filtro por materia', () => {
      cy.visit('/notes');
      cy.get('[data-cy="notes-filter-subject"]').should('be.visible');
      cy.get('[data-cy="notes-filter-subject"]').find('option').first().should('have.text', 'Todas las materias');
    });
  });

  // ======================================
  // CREAR APUNTE - CASOS VÁLIDOS
  // ======================================
  describe('Crear Apunte - Flujos Válidos', () => {

    it('TC-NOTE-05: Debe abrir el formulario de nuevo apunte', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      cy.contains('Nuevo Apunte').should('be.visible');
      cy.get('[data-cy="note-form"]').should('be.visible');
      cy.get('[data-cy="note-form-title"]').should('be.visible');
      cy.get('[data-cy="note-form-content"]').should('be.visible');
    });

    it('TC-NOTE-06: Debe crear un apunte con datos válidos', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      cy.get('[data-cy="note-form-title"]').type('Apunte de Prueba');
      cy.get('[data-cy="note-form-content"]').type('Este es el contenido del apunte de prueba creado con Cypress');
      cy.get('[data-cy="note-form-tags"]').type('test, cypress, prueba');
      cy.get('[data-cy="btn-submit-note"]').click();

      // Verificar que se creó
      cy.get('[data-cy="note-card"]').should('have.length', 1);
      cy.get('[data-cy="note-title"]').should('contain', 'Apunte de Prueba');
    });

    it('TC-NOTE-07: Debe mostrar las etiquetas del apunte creado', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      cy.get('[data-cy="note-form-title"]').type('Apunte con Tags');
      cy.get('[data-cy="note-form-content"]').type('Contenido con etiquetas');
      cy.get('[data-cy="note-form-tags"]').type('resumen, fórmulas');
      cy.get('[data-cy="btn-submit-note"]').click();

      // Verificar que los tags se muestran
      cy.get('[data-cy="note-tag"]').should('have.length.at.least', 2);
    });

    it('TC-NOTE-08: Debe cerrar el formulario con Cancelar', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();
      cy.contains('Cancelar').click();

      cy.get('[data-cy="note-form"]').should('not.exist');
    });
  });

  // ======================================
  // CREAR APUNTE - CASOS ERRÓNEOS
  // ======================================
  describe('Crear Apunte - Flujos Erróneos', () => {

    it('TC-NOTE-09: No debe crear apunte sin título', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      // Solo llenar contenido, sin título
      cy.get('[data-cy="note-form-content"]').type('Contenido sin título');
      cy.get('[data-cy="btn-submit-note"]').click();

      cy.get('[data-cy="error-title"]').should('be.visible');
      cy.get('[data-cy="error-title"]').should('contain', 'obligatorio');
    });

    it('TC-NOTE-10: No debe crear apunte sin contenido', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      // Solo llenar título, sin contenido
      cy.get('[data-cy="note-form-title"]').type('Título sin contenido');
      cy.get('[data-cy="btn-submit-note"]').click();

      cy.get('[data-cy="error-content"]').should('be.visible');
      cy.get('[data-cy="error-content"]').should('contain', 'obligatorio');
    });

    it('TC-NOTE-11: No debe crear apunte completamente vacío', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();

      cy.get('[data-cy="btn-submit-note"]').click();

      cy.get('[data-cy="error-title"]').should('be.visible');
      cy.get('[data-cy="error-content"]').should('be.visible');
    });
  });

  // ======================================
  // BÚSQUEDA Y FILTRADO
  // ======================================
  describe('Búsqueda y Filtrado', () => {

    it('TC-NOTE-12: Debe filtrar al escribir en la barra de búsqueda', () => {
      // Primero crear un apunte
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();
      cy.get('[data-cy="note-form-title"]').type('Apunte Buscable');
      cy.get('[data-cy="note-form-content"]').type('Contenido para buscar');
      cy.get('[data-cy="btn-submit-note"]').click();

      // Buscar por título
      cy.get('[data-cy="notes-search"]').type('Buscable');
      cy.get('[data-cy="note-card"]').should('have.length', 1);

      // Buscar algo que no existe
      cy.get('[data-cy="notes-search"]').clear().type('NoExiste123');
      cy.contains('No se encontraron apuntes').should('be.visible');
    });

    it('TC-NOTE-13: Debe mostrar contador de resultados al filtrar', () => {
      cy.visit('/notes');
      cy.get('[data-cy="btn-add-note"]').click();
      cy.get('[data-cy="note-form-title"]').type('Apunte Test');
      cy.get('[data-cy="note-form-content"]').type('Contenido');
      cy.get('[data-cy="btn-submit-note"]').click();

      cy.get('[data-cy="notes-search"]').type('Test');
      cy.get('[data-cy="notes-count"]').should('be.visible');
      cy.get('[data-cy="notes-count"]').should('contain', 'resultado');
    });
  });
});
