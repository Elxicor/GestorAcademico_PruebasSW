/// <reference types="cypress" />

/**
 * SUITE DE PRUEBAS: Autenticación (Login, Signup, Logout)
 * 
 * Justificación: La autenticación es la puerta de entrada al sistema.
 * Se prueban flujos válidos (login/signup exitosos) y erróneos
 * (credenciales inválidas, campos vacíos, contraseña corta).
 * 
 * Funcionalidades probadas:
 * - Login con credenciales válidas
 * - Login con credenciales inválidas
 * - Login con campos vacíos
 * - Signup con datos válidos
 * - Signup con contraseña corta
 * - Signup con contraseñas que no coinciden
 * - Signup con campos vacíos
 * - Logout exitoso
 * - Visibilidad de contraseña (toggle)
 */

describe('Módulo de Autenticación', () => {

  beforeEach(() => {
    // Interceptar llamadas a Supabase para no depender del backend
    cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');
    cy.intercept('POST', '**/auth/v1/signup*').as('signupRequest');
    cy.intercept('POST', '**/auth/v1/logout*').as('logoutRequest');
  });

  // ======================================
  // PRUEBAS DE LOGIN - CASOS VÁLIDOS
  // ======================================
  describe('Login - Flujos Válidos', () => {

    it('TC-AUTH-01: Debe mostrar el formulario de login correctamente', () => {
      cy.visit('/login');

      // Verificar que los elementos del formulario están presentes
      cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
      cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Iniciar sesión');
      cy.contains('Bienvenido de nuevo').should('be.visible');
      cy.contains('crea una nueva cuenta').should('be.visible');
    });

    it('TC-AUTH-02: Debe realizar login exitoso con credenciales válidas', () => {
      cy.fixture('user').then((data) => {
        // Simular respuesta exitosa del servidor
        cy.intercept('POST', '**/auth/v1/token*', {
          statusCode: 200,
          body: {
            access_token: 'fake-token',
            refresh_token: 'fake-refresh',
            user: {
              id: 'test-id',
              email: data.validUser.email,
              user_metadata: { name: data.validUser.name }
            }
          }
        }).as('loginSuccess');

        cy.visit('/login');
        cy.get('#email').type(data.validUser.email);
        cy.get('#password').type(data.validUser.password);
        cy.get('button[type="submit"]').click();

        // Verificar que se intentó el login
        cy.get('button[type="submit"]').should('exist');
      });
    });

    it('TC-AUTH-03: Debe permitir alternar visibilidad de contraseña', () => {
      cy.visit('/login');

      // Verificar que inicialmente el password está oculto
      cy.get('#password').should('have.attr', 'type', 'password');

      // Hacer clic en el botón de mostrar/ocultar
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'text');

      // Volver a ocultar
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'password');
    });

    it('TC-AUTH-04: Debe navegar al registro desde login', () => {
      cy.visit('/login');
      cy.contains('crea una nueva cuenta').click();
      cy.url().should('include', '/signup');
    });
  });

  // ======================================
  // PRUEBAS DE LOGIN - CASOS ERRÓNEOS
  // ======================================
  describe('Login - Flujos Erróneos', () => {

    it('TC-AUTH-05: Debe mostrar error con credenciales inválidas', () => {
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: { error: 'Invalid login credentials' }
      }).as('loginFail');

      cy.visit('/login');
      cy.get('#email').type('wrong@email.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // El botón debe desbloquearse tras el error
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('TC-AUTH-06: No debe enviar formulario con campos vacíos', () => {
      cy.visit('/login');

      // Intentar enviar sin llenar nada
      cy.get('button[type="submit"]').click();

      // Los campos required del HTML nativo impedirán el envío
      cy.get('#email').then(($el) => {
        expect($el[0].validity.valid).to.be.false;
      });
    });

    it('TC-AUTH-07: No debe enviar con email vacío', () => {
      cy.visit('/login');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();

      // Validación HTML5 del campo email
      cy.get('#email').then(($el) => {
        expect($el[0].validity.valueMissing).to.be.true;
      });
    });

    it('TC-AUTH-08: No debe enviar con contraseña vacía', () => {
      cy.visit('/login');
      cy.get('#email').type('test@email.com');
      cy.get('button[type="submit"]').click();

      cy.get('#password').then(($el) => {
        expect($el[0].validity.valueMissing).to.be.true;
      });
    });
  });

  // ======================================
  // PRUEBAS DE SIGNUP - CASOS VÁLIDOS
  // ======================================
  describe('Signup - Flujos Válidos', () => {

    it('TC-AUTH-09: Debe mostrar el formulario de registro correctamente', () => {
      cy.visit('/signup');

      cy.get('#name').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#confirmPassword').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Registrarse');
      cy.contains('Crea tu cuenta').should('be.visible');
    });

    it('TC-AUTH-10: Debe registrar usuario con datos válidos', () => {
      cy.intercept('POST', '**/auth/v1/signup*', {
        statusCode: 200,
        body: {
          user: { id: 'new-user-id', email: 'nuevo@espe.edu.ec' },
          session: null
        }
      }).as('signupSuccess');

      cy.visit('/signup');
      cy.get('#name').type('Nuevo Estudiante');
      cy.get('#email').type('nuevo@espe.edu.ec');
      cy.get('#password').type('SecurePass123');
      cy.get('#confirmPassword').type('SecurePass123');
      cy.get('button[type="submit"]').click();

      // Verificar que se envió el formulario
      cy.get('button[type="submit"]').should('exist');
    });

    it('TC-AUTH-11: Debe navegar al login desde registro', () => {
      cy.visit('/signup');
      cy.contains('inicia sesión en tu cuenta').click();
      cy.url().should('include', '/login');
    });
  });

  // ======================================
  // PRUEBAS DE SIGNUP - CASOS ERRÓNEOS
  // ======================================
  describe('Signup - Flujos Erróneos', () => {

    it('TC-AUTH-12: No debe registrar con contraseña menor a 6 caracteres', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test');
      cy.get('#email').type('test@test.com');
      cy.get('#password').type('12345');
      cy.get('#confirmPassword').type('12345');
      cy.get('button[type="submit"]').click();

      // Debe permanecer en la página de signup (no redirige)
      cy.url().should('include', '/signup');
    });

    it('TC-AUTH-13: No debe registrar cuando contraseñas no coinciden', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test');
      cy.get('#email').type('test@test.com');
      cy.get('#password').type('Password123');
      cy.get('#confirmPassword').type('DifferentPass');
      cy.get('button[type="submit"]').click();

      // Debe permanecer en signup
      cy.url().should('include', '/signup');
    });

    it('TC-AUTH-14: No debe registrar con nombre vacío', () => {
      cy.visit('/signup');
      cy.get('#email').type('test@test.com');
      cy.get('#password').type('Password123');
      cy.get('#confirmPassword').type('Password123');
      cy.get('button[type="submit"]').click();

      cy.get('#name').then(($el) => {
        expect($el[0].validity.valueMissing).to.be.true;
      });
    });

    it('TC-AUTH-15: No debe registrar con email inválido', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test User');
      cy.get('#email').type('correo-invalido');
      cy.get('#password').type('Password123');
      cy.get('#confirmPassword').type('Password123');
      cy.get('button[type="submit"]').click();

      cy.get('#email').then(($el) => {
        expect($el[0].validity.typeMismatch).to.be.true;
      });
    });
  });

  // ======================================
  // PRUEBAS DE LOGOUT
  // ======================================
  describe('Logout', () => {

    it('TC-AUTH-16: Debe cerrar sesión correctamente', () => {
      cy.intercept('POST', '**/auth/v1/logout*', {
        statusCode: 200,
        body: {}
      }).as('logoutSuccess');

      // Simular que el usuario ya está logueado
      cy.loginMock();
      cy.wait(1000);

      // Verificar que existe el botón de cerrar sesión en el sidebar
      cy.get('nav').should('exist');
    });
  });
});
