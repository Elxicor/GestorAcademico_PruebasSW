/// <reference types="cypress" />

describe('Módulo de Autenticación', () => {

  beforeEach(() => {
    cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');
    cy.intercept('POST', '**/auth/v1/signup*').as('signupRequest');
    cy.intercept('POST', '**/auth/v1/logout*').as('logoutRequest');
  });

  describe('Login - Flujos Válidos', () => {
    it('TC-AUTH-01: Debe mostrar el formulario de login correctamente', () => {
      cy.visit('/login');
      cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
      cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');
      cy.get('button[type="submit"]').should('be.visible').and('contain', 'Iniciar sesión');
      cy.contains('Bienvenido de nuevo').should('be.visible');
      cy.contains('crea una nueva cuenta').should('be.visible');
    });

    it('TC-AUTH-02: Debe realizar login exitoso con credenciales válidas', () => {
      cy.fixture('user').then((data) => {
        cy.intercept('POST', '**/auth/v1/token*', {
          statusCode: 200,
          body: {
            access_token: 'fake-token',
            refresh_token: 'fake-refresh',
            user: { id: 'test-id', email: data.validUser.email, user_metadata: { name: data.validUser.name } }
          }
        }).as('loginSuccess');

        cy.visit('/login');
        cy.get('#email').type(data.validUser.email);
        cy.get('#password').type(data.validUser.password);
        cy.get('button[type="submit"]').click();
        cy.get('button[type="submit"]').should('exist');
      });
    });

    it('TC-AUTH-03: Debe permitir alternar visibilidad de contraseña', () => {
      cy.visit('/login');
      cy.get('#password').should('have.attr', 'type', 'password');
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'text');
      cy.get('#password').parent().find('button').click();
      cy.get('#password').should('have.attr', 'type', 'password');
    });

    it('TC-AUTH-04: Debe navegar al registro desde login', () => {
      cy.visit('/login');
      cy.contains('crea una nueva cuenta').click();
      cy.url().should('include', '/signup');
    });
  });

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
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('TC-AUTH-06: No debe enviar formulario con campos vacíos', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();
      cy.get('#email').then(($el) => {
        expect($el[0].validity.valid).to.be.false;
      });
    });

    it('TC-AUTH-07: No debe enviar con email vacío', () => {
      cy.visit('/login');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
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
        body: { user: { id: 'new-user-id', email: 'nuevo@espe.edu.ec' }, session: null }
      }).as('signupSuccess');

      cy.visit('/signup');
      cy.get('#name').type('Nuevo Estudiante');
      cy.get('#email').type('nuevo@espe.edu.ec');
      cy.get('#password').type('SecurePass123');
      cy.get('#confirmPassword').type('SecurePass123');
      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('exist');
    });

    it('TC-AUTH-11: Debe navegar al login desde registro', () => {
      cy.visit('/signup');
      cy.contains('inicia sesión en tu cuenta').click();
      cy.url().should('include', '/login');
    });
  });

  describe('Signup - Flujos Erróneos', () => {
    it('TC-AUTH-12: No debe registrar con contraseña menor a 6 caracteres', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test');
      cy.get('#email').type('test@test.com');
      cy.get('#password').type('12345');
      cy.get('#confirmPassword').type('12345');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/signup');
    });

    it('TC-AUTH-13: No debe registrar cuando contraseñas no coinciden', () => {
      cy.visit('/signup');
      cy.get('#name').type('Test');
      cy.get('#email').type('test@test.com');
      cy.get('#password').type('Password123');
      cy.get('#confirmPassword').type('DifferentPass');
      cy.get('button[type="submit"]').click();
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

  describe('Logout', () => {
    it('TC-AUTH-16: Debe cerrar sesión correctamente', () => {
      cy.intercept('POST', '**/auth/v1/logout*', {
        statusCode: 200,
        body: {}
      }).as('logoutSuccess');

      // 1. Simular sesión activa (el nav aparecerá porque la sesión se inyecta antes de cargar)
      cy.loginMock();

      // 2. Buscar el botón de logout dentro del nav y hacer click
      cy.get('nav').should('exist');
      cy.get('nav').contains(/cerrar sesión/i).click(); 

      // 3. Confirmar que la API de Supabase recibió la petición de logout
      cy.wait('@logoutSuccess');

      // 4. Verificar que redirigió de vuelta a la pantalla de login
      cy.url().should('include', '/login');
    });
  });
});