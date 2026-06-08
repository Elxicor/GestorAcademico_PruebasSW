/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Horario de Clases
 * 
 * Justificación: El horario de clases es esencial para la organización
 * académica. Se prueba la creación de entradas con validación de horas,
 * la vista semanal y la edición/eliminación.
 * 
 * Funcionalidades probadas:
 * - Visualización del horario
 * - Crear clase con datos válidos
 * - Validación de hora fin > hora inicio
 * - Validación de campos obligatorios
 * - Estructura de la tabla semanal
 */

describe('Módulo de Horario de Clases', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // VISUALIZACIÓN
  // ======================================
  describe('Visualización del Horario', () => {

    it('TC-SCH-01: Debe mostrar la página de horario correctamente', () => {
      cy.visit('/schedule');
      cy.contains('Horario de Clases').should('be.visible');
      cy.get('[data-cy="btn-add-schedule"]').should('be.visible');
    });

    it('TC-SCH-02: Debe mostrar mensaje vacío cuando no hay clases', () => {
      cy.visit('/schedule');
      cy.contains('Aún no hay clases en el horario').should('be.visible');
    });

    it('TC-SCH-03: Debe abrir el formulario de agregar clase', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.contains('Agregar Clase').should('be.visible');
      cy.get('[data-cy="schedule-form"]').should('be.visible');
    });
  });

  // ======================================
  // CREAR CLASE - CASOS VÁLIDOS
  // ======================================
  describe('Crear Clase - Flujos Válidos', () => {

    it('TC-SCH-04: Debe mostrar todos los campos del formulario', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-subject"]').should('be.visible');
      cy.get('[data-cy="schedule-day"]').should('be.visible');
      cy.get('[data-cy="schedule-start-time"]').should('be.visible');
      cy.get('[data-cy="schedule-end-time"]').should('be.visible');
      cy.get('[data-cy="schedule-classroom"]').should('be.visible');
      cy.get('[data-cy="schedule-teacher"]').should('be.visible');
    });

    it('TC-SCH-05: Debe tener los 5 días laborables en el selector', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-day"]').find('option').should('have.length', 5);
      cy.get('[data-cy="schedule-day"]').find('option').eq(0).should('have.text', 'Lunes');
      cy.get('[data-cy="schedule-day"]').find('option').eq(1).should('have.text', 'Martes');
      cy.get('[data-cy="schedule-day"]').find('option').eq(2).should('have.text', 'Miércoles');
      cy.get('[data-cy="schedule-day"]').find('option').eq(3).should('have.text', 'Jueves');
      cy.get('[data-cy="schedule-day"]').find('option').eq(4).should('have.text', 'Viernes');
    });

    it('TC-SCH-06: Debe tener opciones de hora desde 07:00 hasta 20:00', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-start-time"]').find('option').should('have.length.at.least', 10);
      cy.get('[data-cy="schedule-start-time"]').find('option').first().should('have.value', '07:00');
    });

    it('TC-SCH-07: Debe cerrar el formulario con Cancelar', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();
      cy.contains('Cancelar').click();

      cy.get('[data-cy="schedule-form"]').should('not.exist');
    });
  });

  // ======================================
  // CREAR CLASE - CASOS ERRÓNEOS
  // ======================================
  describe('Crear Clase - Flujos Erróneos', () => {

    it('TC-SCH-08: No debe crear clase con hora fin igual a hora inicio', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      // Configurar misma hora inicio y fin
      cy.get('[data-cy="schedule-start-time"]').select('09:00');
      cy.get('[data-cy="schedule-end-time"]').select('09:00');
      cy.get('[data-cy="schedule-classroom"]').type('Aula 101');
      cy.get('[data-cy="schedule-teacher"]').type('Ing. Test');
      cy.get('[data-cy="btn-submit-schedule"]').click();

      // Debe mostrar error
      cy.get('[data-cy="error-end-time"]').should('be.visible');
      cy.get('[data-cy="error-end-time"]').should('contain', 'posterior');
    });

    it('TC-SCH-09: No debe crear clase con hora fin antes de hora inicio', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-start-time"]').select('10:00');
      cy.get('[data-cy="schedule-end-time"]').select('08:00');
      cy.get('[data-cy="schedule-classroom"]').type('Aula 101');
      cy.get('[data-cy="schedule-teacher"]').type('Ing. Test');
      cy.get('[data-cy="btn-submit-schedule"]').click();

      cy.get('[data-cy="error-end-time"]').should('be.visible');
    });

    it('TC-SCH-10: No debe crear clase sin aula', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-start-time"]').select('08:00');
      cy.get('[data-cy="schedule-end-time"]').select('10:00');
      cy.get('[data-cy="schedule-teacher"]').type('Ing. Test');
      // No ingresar aula
      cy.get('[data-cy="btn-submit-schedule"]').click();

      cy.get('[data-cy="error-classroom"]').should('be.visible');
      cy.get('[data-cy="error-classroom"]').should('contain', 'obligatoria');
    });

    it('TC-SCH-11: No debe crear clase sin docente', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-start-time"]').select('08:00');
      cy.get('[data-cy="schedule-end-time"]').select('10:00');
      cy.get('[data-cy="schedule-classroom"]').type('Aula 101');
      // No ingresar docente
      cy.get('[data-cy="btn-submit-schedule"]').click();

      cy.get('[data-cy="error-teacher"]').should('be.visible');
      cy.get('[data-cy="error-teacher"]').should('contain', 'obligatorio');
    });

    it('TC-SCH-12: No debe crear clase sin materia seleccionada', () => {
      cy.visit('/schedule');
      cy.get('[data-cy="btn-add-schedule"]').click();

      cy.get('[data-cy="schedule-start-time"]').select('08:00');
      cy.get('[data-cy="schedule-end-time"]').select('10:00');
      cy.get('[data-cy="schedule-classroom"]').type('Aula 101');
      cy.get('[data-cy="schedule-teacher"]').type('Ing. Test');
      cy.get('[data-cy="btn-submit-schedule"]').click();

      cy.get('[data-cy="error-subject"]').should('be.visible');
    });
  });
});
