/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Perfil del Estudiante y Timer Pomodoro
 * 
 * Justificación: El perfil contiene las preferencias de estudio
 * que afectan al funcionamiento del timer Pomodoro.
 * Se prueban la visualización, edición de datos y preferencias,
 * así como el funcionamiento del timer en el dashboard.
 * 
 * Funcionalidades probadas:
 * - Visualización del perfil
 * - Edición de nombre y bio
 * - Configuración de preferencias de estudio
 * - Toggle de notificaciones y sonido
 * - Timer Pomodoro (iniciar, pausar, reiniciar)
 * - Configuración del timer
 */

describe('Módulo de Perfil y Timer Pomodoro', () => {

  beforeEach(() => {
    cy.loginMock();
    cy.wait(500);
  });

  // ======================================
  // PERFIL - VISUALIZACIÓN
  // ======================================
  describe('Perfil - Visualización', () => {

    it('TC-PROF-01: Debe mostrar la página de perfil correctamente', () => {
      cy.visit('/profile');
      cy.contains('Perfil del Estudiante').should('be.visible');
    });

    it('TC-PROF-02: Debe mostrar los campos de información personal', () => {
      cy.visit('/profile');

      // Campo de nombre
      cy.get('input[placeholder="Tu Nombre"]').should('be.visible');
      // Campo de email (readonly)
      cy.get('input[type="email"]').should('be.visible');
      // Textarea de bio
      cy.get('textarea[placeholder="Cuéntanos sobre ti..."]').should('be.visible');
    });

    it('TC-PROF-03: Debe mostrar la sección de preferencias de estudio', () => {
      cy.visit('/profile');
      cy.contains('Preferencias de Estudio').should('be.visible');
      cy.contains('Horario de Estudio Preferido').should('be.visible');
      cy.contains('Sesión de Enfoque (minutos)').should('be.visible');
      cy.contains('Duración del Descanso (minutos)').should('be.visible');
      cy.contains('Meta Diaria de Estudio (horas)').should('be.visible');
    });

    it('TC-PROF-04: Debe mostrar la sección de logros', () => {
      cy.visit('/profile');
      cy.contains('Logros').should('be.visible');
    });

    it('TC-PROF-05: Debe tener el botón de guardar cambios', () => {
      cy.visit('/profile');
      cy.contains('Guardar Cambios').should('be.visible');
    });
  });

  // ======================================
  // PERFIL - EDICIÓN
  // ======================================
  describe('Perfil - Edición', () => {

    it('TC-PROF-06: Debe permitir editar el nombre', () => {
      cy.visit('/profile');
      cy.get('input[placeholder="Tu Nombre"]').clear().type('Juan Carlos');
      cy.get('input[placeholder="Tu Nombre"]').should('have.value', 'Juan Carlos');
    });

    it('TC-PROF-07: Debe permitir editar la bio', () => {
      cy.visit('/profile');
      cy.get('textarea[placeholder="Cuéntanos sobre ti..."]').clear().type('Estudiante de Ing. Software en ESPE');
      cy.get('textarea[placeholder="Cuéntanos sobre ti..."]').should('have.value', 'Estudiante de Ing. Software en ESPE');
    });

    it('TC-PROF-08: Debe tener el email como campo solo lectura', () => {
      cy.visit('/profile');
      cy.get('input[type="email"]').should('have.attr', 'readOnly');
    });

    it('TC-PROF-09: Debe permitir cambiar horario de estudio preferido', () => {
      cy.visit('/profile');
      cy.get('select').contains('Mañana').should('exist');

      // Verificar que tiene las 4 opciones
      cy.get('select').first().find('option').should('have.length', 4);
    });

    it('TC-PROF-10: Debe tener toggles para notificaciones y sonido', () => {
      cy.visit('/profile');
      cy.contains('Notificaciones').should('be.visible');
      cy.contains('Efectos de Sonido').should('be.visible');

      // Verificar que los checkboxes existen
      cy.get('input[type="checkbox"]').should('have.length.at.least', 2);
    });
  });

  // ======================================
  // TIMER POMODORO - DASHBOARD
  // ======================================
  describe('Timer Pomodoro', () => {

    it('TC-PROF-11: Debe mostrar el timer en el dashboard', () => {
      cy.visit('/');
      // El timer muestra el formato MM:SS
      cy.get('[role="timer"]').should('be.visible');
      cy.get('[role="timer"]').should('contain', ':');
    });

    it('TC-PROF-12: Debe tener botones de play/pause y reset', () => {
      cy.visit('/');
      cy.get('[aria-label="Iniciar temporizador"]').should('be.visible');
      cy.get('[aria-label="Reiniciar temporizador"]').should('be.visible');
    });

    it('TC-PROF-13: Debe mostrar el indicador de sesión', () => {
      cy.visit('/');
      cy.contains('Sesión').should('be.visible');
      cy.contains('de').should('be.visible');
    });

    it('TC-PROF-14: Debe mostrar "Tiempo de Trabajo" inicialmente', () => {
      cy.visit('/');
      cy.contains('Tiempo de Trabajo').should('be.visible');
    });

    it('TC-PROF-15: Debe tener botón de configuración del timer', () => {
      cy.visit('/');
      cy.get('[aria-label*="configuración"]').should('be.visible');
    });

    it('TC-PROF-16: Debe mostrar la configuración al hacer clic en ajustes', () => {
      cy.visit('/');
      cy.get('[aria-label*="configuración"]').click();

      cy.contains('Duración del Trabajo').should('be.visible');
      cy.contains('Duración del Descanso').should('be.visible');
      cy.contains('Descanso Largo').should('be.visible');
      cy.contains('Guardar Configuración').should('be.visible');
    });

    it('TC-PROF-17: Debe tener el selector de materia para la sesión', () => {
      cy.visit('/');
      cy.get('select[aria-label="Seleccionar materia de estudio"]').should('be.visible');
    });

    it('TC-PROF-18: Debe tener botón de sonido', () => {
      cy.visit('/');
      cy.get('[aria-label*="sonido"]').should('be.visible');
    });
  });
});
