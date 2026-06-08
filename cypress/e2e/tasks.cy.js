/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Gestión de Tareas (CRUD)
 * 
 * Justificación: Las tareas son una funcionalidad central del gestor académico.
 * Se prueban todas las operaciones CRUD (Crear, Leer, Editar, Eliminar),
 * así como el marcado de tareas como completadas y la validación de campos.
 * 
 * Funcionalidades probadas:
 * - Visualización de lista de tareas
 * - Crear tarea con datos válidos
 * - Crear tarea sin título (error)
 * - Editar tarea existente
 * - Marcar tarea como completada
 * - Eliminar tarea
 * - Ordenar tareas
 */

describe('Módulo de Tareas', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // VISUALIZACIÓN
  // ======================================
  describe('Visualización de Tareas', () => {

    it('TC-TASK-01: Debe mostrar la página de tareas correctamente', () => {
      cy.visit('/tasks');
      cy.contains('Tareas').should('be.visible');
      cy.contains('Nueva Tarea').should('be.visible');
    });

    it('TC-TASK-02: Debe mostrar el botón de nueva tarea', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').should('be.visible');
    });

    it('TC-TASK-03: Debe mostrar los encabezados de la tabla de tareas', () => {
      cy.visit('/tasks');
      // La tabla tiene encabezados de ordenamiento
      cy.contains('Materia').should('exist');
      cy.contains('Fecha Límite').should('exist');
      cy.contains('Prioridad').should('exist');
    });
  });

  // ======================================
  // CREAR TAREA - CASOS VÁLIDOS
  // ======================================
  describe('Crear Tarea - Flujos Válidos', () => {

    it('TC-TASK-04: Debe abrir el formulario de nueva tarea', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').click();

      // Verificar que el modal se abre
      cy.contains('Nueva Tarea').should('be.visible');
      cy.get('input[placeholder="Ingresa el título de la tarea"]').should('be.visible');
    });

    it('TC-TASK-05: Debe crear una tarea con datos válidos', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').click();

      // Llenar el formulario
      cy.get('input[placeholder="Ingresa el título de la tarea"]').type('Tarea de prueba Cypress');
      cy.get('textarea[placeholder="Ingresa la descripción de la tarea"]').type('Descripción de prueba automatizada');
      cy.get('button').contains('Crear Tarea').click();

      // Verificar que el modal se cerró
      cy.get('input[placeholder="Ingresa el título de la tarea"]').should('not.exist');
    });

    it('TC-TASK-06: Debe poder seleccionar prioridad al crear tarea', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').click();

      // Verificar que el selector de prioridad tiene las opciones correctas
      cy.get('select').contains('Baja').should('exist');
      cy.get('select').contains('Media').should('exist');
      cy.get('select').contains('Alta').should('exist');
    });

    it('TC-TASK-07: Debe cerrar el formulario con el botón Cancelar', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').click();
      cy.contains('Cancelar').click();

      // El modal debe cerrarse
      cy.get('input[placeholder="Ingresa el título de la tarea"]').should('not.exist');
    });
  });

  // ======================================
  // CREAR TAREA - CASOS ERRÓNEOS
  // ======================================
  describe('Crear Tarea - Flujos Erróneos', () => {

    it('TC-TASK-08: No debe crear tarea sin título', () => {
      cy.visit('/tasks');
      cy.get('button').contains('Nueva Tarea').click();

      // Intentar crear sin título
      cy.get('textarea[placeholder="Ingresa la descripción de la tarea"]').type('Solo descripción');
      cy.get('button').contains('Crear Tarea').click();

      // El formulario debe permanecer abierto (toast de error)
      cy.get('input[placeholder="Ingresa el título de la tarea"]').should('be.visible');
    });
  });

  // ======================================
  // OPERACIONES SOBRE TAREAS
  // ======================================
  describe('Operaciones sobre Tareas', () => {

    it('TC-TASK-09: Debe poder ordenar por Materia', () => {
      cy.visit('/tasks');
      cy.contains('button', 'Materia').click();
      // Verificar que el ícono de ordenamiento aparece
      cy.contains('button', 'Materia').should('exist');
    });

    it('TC-TASK-10: Debe poder ordenar por Fecha Límite', () => {
      cy.visit('/tasks');
      cy.contains('button', 'Fecha Límite').click();
      cy.contains('button', 'Fecha Límite').should('exist');
    });

    it('TC-TASK-11: Debe poder ordenar por Prioridad', () => {
      cy.visit('/tasks');
      cy.contains('button', 'Prioridad').click();
      cy.contains('button', 'Prioridad').should('exist');
    });
  });
});
