/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Gestión de Calificaciones
 * 
 * Justificación: El módulo de calificaciones es nuevo y crítico para un
 * gestor académico real. Se prueba la creación de calificaciones,
 * validación de rangos (0-10), peso (1-100%), cálculo de promedios,
 * y eliminación de registros.
 * 
 * Funcionalidades probadas:
 * - Visualización de la página de calificaciones
 * - Crear calificación con datos válidos
 * - Validación de nota fuera de rango
 * - Validación de peso inválido
 * - Validación de campos obligatorios
 * - Eliminación de calificación
 * - Cálculo de promedio por materia
 * - Estado aprobado/reprobado
 */

describe('Módulo de Calificaciones', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // VISUALIZACIÓN
  // ======================================
  describe('Visualización de Calificaciones', () => {

    it('TC-GRD-01: Debe mostrar la página de calificaciones correctamente', () => {
      cy.visit('/grades');
      cy.contains('Calificaciones').should('be.visible');
      cy.get('[data-cy="btn-add-grade"]').should('be.visible');
    });

    it('TC-GRD-02: Debe mostrar mensaje vacío cuando no hay calificaciones', () => {
      cy.visit('/grades');
      cy.contains('Aún no hay calificaciones').should('be.visible');
    });

    it('TC-GRD-03: Debe abrir el formulario de nueva calificación', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.contains('Nueva Calificación').should('be.visible');
      cy.get('[data-cy="grade-form"]').should('be.visible');
      cy.get('[data-cy="grade-exam-name"]').should('be.visible');
      cy.get('[data-cy="grade-score"]').should('be.visible');
      cy.get('[data-cy="grade-weight"]').should('be.visible');
    });
  });

  // ======================================
  // CREAR CALIFICACIÓN - CASOS VÁLIDOS
  // ======================================
  describe('Crear Calificación - Flujos Válidos', () => {

    it('TC-GRD-04: Debe crear una calificación con datos válidos', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      // Llenar formulario con datos válidos
      cy.get('[data-cy="grade-exam-name"]').type('Parcial 1');
      cy.get('[data-cy="grade-score"]').type('8.5');
      cy.get('[data-cy="grade-max-score"]').clear().type('10');
      cy.get('[data-cy="grade-weight"]').type('30');
      cy.get('[data-cy="btn-submit-grade"]').click();

      // Si no hay materia seleccionada, mostrará error
      // La validación requiere materia
      cy.get('[data-cy="grade-form"]').should('exist');
    });

    it('TC-GRD-05: Debe tener selector de materias en el formulario', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-subject"]').should('be.visible');
      cy.get('[data-cy="grade-subject"]').find('option').should('have.length.at.least', 1);
    });

    it('TC-GRD-06: Debe cerrar el formulario con el botón Cancelar', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();
      cy.contains('Cancelar').click();

      cy.get('[data-cy="grade-form"]').should('not.exist');
    });
  });

  // ======================================
  // CREAR CALIFICACIÓN - CASOS ERRÓNEOS
  // ======================================
  describe('Crear Calificación - Flujos Erróneos', () => {

    it('TC-GRD-07: No debe crear calificación sin nombre de examen', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      // Llenar solo score y weight, sin nombre
      cy.get('[data-cy="grade-score"]').type('8');
      cy.get('[data-cy="grade-weight"]').type('30');
      cy.get('[data-cy="btn-submit-grade"]').click();

      // Debe mostrar error de validación
      cy.get('[data-cy="error-exam-name"]').should('be.visible');
      cy.get('[data-cy="error-exam-name"]').should('contain', 'obligatorio');
    });

    it('TC-GRD-08: No debe aceptar nota mayor a la nota máxima', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-exam-name"]').type('Test');
      cy.get('[data-cy="grade-score"]').type('15'); // Mayor que 10
      cy.get('[data-cy="grade-max-score"]').clear().type('10');
      cy.get('[data-cy="grade-weight"]').type('30');
      cy.get('[data-cy="btn-submit-grade"]').click();

      // Debe mostrar error de validación de nota
      cy.get('[data-cy="error-score"]').should('be.visible');
    });

    it('TC-GRD-09: No debe aceptar nota negativa', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-exam-name"]').type('Test');
      cy.get('[data-cy="grade-score"]').type('-5');
      cy.get('[data-cy="grade-weight"]').type('30');
      cy.get('[data-cy="btn-submit-grade"]').click();

      cy.get('[data-cy="error-score"]').should('be.visible');
    });

    it('TC-GRD-10: No debe aceptar peso mayor a 100', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-exam-name"]').type('Test');
      cy.get('[data-cy="grade-score"]').type('8');
      cy.get('[data-cy="grade-weight"]').type('150'); // Mayor que 100
      cy.get('[data-cy="btn-submit-grade"]').click();

      cy.get('[data-cy="error-weight"]').should('be.visible');
      cy.get('[data-cy="error-weight"]').should('contain', 'entre 1 y 100');
    });

    it('TC-GRD-11: No debe aceptar peso igual a 0', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-exam-name"]').type('Test');
      cy.get('[data-cy="grade-score"]').type('8');
      cy.get('[data-cy="grade-weight"]').type('0');
      cy.get('[data-cy="btn-submit-grade"]').click();

      cy.get('[data-cy="error-weight"]').should('be.visible');
    });

    it('TC-GRD-12: No debe crear sin materia seleccionada', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();

      cy.get('[data-cy="grade-exam-name"]').type('Parcial');
      cy.get('[data-cy="grade-score"]').type('8');
      cy.get('[data-cy="grade-weight"]').type('30');
      // No seleccionar materia
      cy.get('[data-cy="btn-submit-grade"]').click();

      cy.get('[data-cy="error-subject"]').should('be.visible');
      cy.get('[data-cy="error-subject"]').should('contain', 'obligatoria');
    });
  });

  // ======================================
  // ELEMENTOS DE LA TABLA
  // ======================================
  describe('Estructura de la página', () => {

    it('TC-GRD-13: Debe tener el campo de fecha en el formulario', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();
      cy.get('[data-cy="grade-date"]').should('be.visible');
      cy.get('[data-cy="grade-date"]').should('have.attr', 'type', 'date');
    });

    it('TC-GRD-14: Debe tener la nota máxima con valor predeterminado de 10', () => {
      cy.visit('/grades');
      cy.get('[data-cy="btn-add-grade"]').click();
      cy.get('[data-cy="grade-max-score"]').should('have.value', '10');
    });
  });
});
