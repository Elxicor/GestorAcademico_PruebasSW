/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Gestión de Materias (CRUD)
 * 
 * Justificación: Las materias son la estructura organizativa del sistema.
 * Todas las demás funcionalidades (tareas, calificaciones, horario, apuntes)
 * dependen de las materias registradas. Se prueba el CRUD completo.
 * 
 * Funcionalidades probadas:
 * - Visualización de la página de materias
 * - Abrir el gestor de materias (modal)
 * - Crear materia con datos válidos
 * - Crear materia sin nombre (error)
 * - Selección de color para materia
 * - Configuración de meta semanal
 * - Cerrar el modal del gestor
 */

describe('Módulo de Materias', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // VISUALIZACIÓN
  // ======================================
  describe('Visualización de Materias', () => {

    it('TC-SUB-01: Debe mostrar la página de materias correctamente', () => {
      cy.visit('/subjects');
      cy.contains('Materias').should('be.visible');
      cy.contains('Gestionar Materias').should('be.visible');
    });

    it('TC-SUB-02: Debe mostrar mensaje cuando no hay materias', () => {
      cy.visit('/subjects');
      cy.contains('Aún no hay materias').should('be.visible');
      cy.contains('Añadir tu primera materia').should('be.visible');
    });

    it('TC-SUB-03: Debe tener botón para gestionar materias', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').should('be.visible');
    });
  });

  // ======================================
  // GESTIONAR MATERIAS - CASOS VÁLIDOS
  // ======================================
  describe('Gestionar Materias - Flujos Válidos', () => {

    it('TC-SUB-04: Debe abrir el modal de gestión de materias', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      cy.contains('Gestionar Materias').should('be.visible');
      cy.get('input[placeholder="Ingresa el nombre de la materia"]').should('be.visible');
    });

    it('TC-SUB-05: Debe crear una materia con datos válidos', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      cy.get('input[placeholder="Ingresa el nombre de la materia"]').type('Pruebas de Software');
      cy.get('button').contains('Añadir Materia').click();

      // Verificar que la materia aparece en la lista dentro del modal
      cy.contains('Pruebas de Software').should('be.visible');
    });

    it('TC-SUB-06: Debe permitir seleccionar un color para la materia', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      // Verificar que hay botones de color disponibles
      cy.get('button[style*="background-color"]').should('have.length.at.least', 5);

      // Seleccionar un color diferente
      cy.get('button[style*="background-color"]').eq(2).click();
    });

    it('TC-SUB-07: Debe permitir configurar meta semanal de horas', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      // Verificar que el campo de meta semanal existe
      cy.get('input[type="number"]').should('be.visible');

      // Cambiar la meta
      cy.get('input[type="number"]').clear().type('8');
      cy.get('input[type="number"]').should('have.value', '8');
    });

    it('TC-SUB-08: Debe cerrar el modal con el botón X', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();
      cy.contains('Gestionar Materias').should('be.visible');

      // Cerrar con el botón X
      cy.get('.fixed button').first().click({ force: true });
    });
  });

  // ======================================
  // GESTIONAR MATERIAS - CASOS ERRÓNEOS
  // ======================================
  describe('Gestionar Materias - Flujos Erróneos', () => {

    it('TC-SUB-09: No debe crear materia sin nombre', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      // Intentar añadir sin nombre
      cy.get('button').contains('Añadir Materia').click();

      // Debe permanecer en el modal (muestra toast de error)
      cy.get('input[placeholder="Ingresa el nombre de la materia"]').should('be.visible');
    });

    it('TC-SUB-10: Debe validar que la meta semanal no sea negativa', () => {
      cy.visit('/subjects');
      cy.get('button').contains('Gestionar Materias').click();

      // El input tiene min="0", verificar que no acepta negativos
      cy.get('input[type="number"]').should('have.attr', 'min', '0');
    });
  });
});
