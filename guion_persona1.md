# 🎤 Guion de Exposición — Persona 1

## Tema: Introducción al Proyecto, Estrategia de Pruebas, Tests de Autenticación y Navegación

---

## 📌 Parte 1: Introducción al Proyecto (3 minutos)

### Qué decir:
> "Buenas tardes. Nuestro proyecto consiste en la automatización de pruebas E2E con Cypress para un Sistema de Gestión Académica llamado **GestorAcadémico**."

> "GestorAcadémico es una aplicación web construida con **React + TypeScript + Vite** que utiliza **Supabase** como backend. El sistema cuenta con **10 módulos funcionales**: Autenticación, Dashboard con Timer Pomodoro, Tareas, Materias, **Calificaciones, Horario de Clases, Apuntes, Cálculo de GPA**, Estadísticas y Perfil del Estudiante."

> "Los últimos 4 módulos que mencioné fueron **añadidos por nosotros** para completar las funcionalidades esperadas de un verdadero gestor académico."

### Por qué se eligió Cypress:
> "Elegimos **Cypress** porque es el framework líder para pruebas E2E en aplicaciones web modernas. Sus ventajas son:
> 1. **Ejecución en el navegador real** — no simula, realmente interactúa con el DOM
> 2. **Time-travel debugging** — permite ver cada paso del test
> 3. **Interceptación de red (cy.intercept)** — nos permitió mockear Supabase sin depender del backend
> 4. **Assertions claras** con sintaxis encadenada (`.should()`)
> 5. **Selectores data-cy** — best practice para tests estables"

---

## 📌 Parte 2: Estrategia de Testing (2 minutos)

### Qué decir:
> "Nuestra estrategia se basó en **3 principios**:"

> "**1. Independencia del backend.** Usamos `cy.intercept()` para interceptar todas las llamadas HTTP a Supabase y devolver respuestas simuladas. Esto hace los tests **deterministas y reproducibles**."

> "**2. Cobertura de flujos válidos Y erróneos.** Cada módulo tiene pruebas positivas (datos correctos) y negativas (campos vacíos, datos fuera de rango). Esto garantiza que la aplicación maneja correctamente tanto el 'camino feliz' como los errores."

> "**3. Datos de prueba centralizados.** Usamos el archivo `cypress/fixtures/user.json` con datos realistas (materias de ESPE, calificaciones del semestre) y comandos personalizados en `commands.js` para reutilizar lógica de autenticación."

### Mostrar código:
```javascript
// cypress/support/commands.js
Cypress.Commands.add('mockSupabaseAuth', () => {
  const fakeUser = {
    id: 'test-user-id-123',
    email: 'test@espe.edu.ec',
    user_metadata: { name: 'Estudiante Test' }
  };
  cy.intercept('GET', '**/auth/v1/user', {
    statusCode: 200,
    body: fakeUser,
  }).as('getUser');
});

Cypress.Commands.add('loginMock', () => {
  cy.mockSupabaseAuth();
  cy.visit('/');
});
```

> "Este comando `loginMock` se reutiliza en **todos** los archivos de test. Es un ejemplo de **buena estructura Cypress**: comandos DRY, reutilizables y encapsulados."

---

## 📌 Parte 3: Test Suite de Autenticación — `auth.cy.js` (5 minutos)

### Qué decir:
> "El archivo `auth.cy.js` contiene **16 casos de prueba** organizados en 5 bloques: Login válido, Login erróneo, Signup válido, Signup erróneo y Logout."

### Explicar los tests clave:

#### TC-AUTH-01: Verificación del formulario
```javascript
it('TC-AUTH-01: Debe mostrar el formulario de login correctamente', () => {
  cy.visit('/login');
  cy.get('#email').should('be.visible').and('have.attr', 'type', 'email');
  cy.get('#password').should('be.visible').and('have.attr', 'type', 'password');
  cy.get('button[type="submit"]').should('be.visible').and('contain', 'Iniciar sesión');
  cy.contains('Bienvenido de nuevo').should('be.visible');
});
```
> "Aquí verificamos que **todos los elementos** del formulario están presentes y tienen los atributos correctos. Usamos `cy.get()` con selectores por ID y `cy.contains()` para texto. Las assertions `.should('be.visible')` y `.and()` encadenadas verifican múltiples propiedades."

#### TC-AUTH-05: Login con credenciales inválidas
```javascript
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
```
> "Este es un **caso erróneo**. Simulamos que Supabase responde con status 400 usando `cy.intercept()`. Luego verificamos que el botón se desbloquea tras el error, permitiendo al usuario reintentar."

#### TC-AUTH-03: Toggle de visibilidad de contraseña
```javascript
it('TC-AUTH-03: Debe permitir alternar visibilidad de contraseña', () => {
  cy.visit('/login');
  cy.get('#password').should('have.attr', 'type', 'password');
  cy.get('#password').parent().find('button').click();
  cy.get('#password').should('have.attr', 'type', 'text');
  cy.get('#password').parent().find('button').click();
  cy.get('#password').should('have.attr', 'type', 'password');
});
```
> "Aquí probamos una **micro-funcionalidad de UX**: el botón del ojo que alterna entre ocultar y mostrar la contraseña. Verificamos que el atributo `type` cambia entre `password` y `text`."

---

## 📌 Parte 4: Test Suite de Navegación — `navigation.cy.js` (3 minutos)

### Qué decir:
> "El archivo `navigation.cy.js` contiene **18 casos de prueba** que verifican el comportamiento de las rutas."

#### TC-NAV-01 al 09: Rutas protegidas sin autenticación
```javascript
it('TC-NAV-01: Debe redirigir al login cuando se accede a / sin autenticación', () => {
  cy.visit('/');
  cy.url().should('include', '/login');
});
```
> "Probamos que **cada ruta protegida** redirige a `/login` cuando no hay sesión. Esto verifica que el componente `PrivateRoute` funciona correctamente para las 9 rutas del sistema."

#### TC-NAV-10: Página 404
```javascript
it('TC-NAV-10: Debe mostrar la página 404 para una ruta inexistente', () => {
  cy.visit('/ruta-que-no-existe', { failOnStatusCode: false });
  cy.contains('404').should('be.visible');
  cy.contains('Página no encontrada').should('be.visible');
});
```
> "Verificamos que rutas inexistentes muestran la página 404 correctamente. El parámetro `failOnStatusCode: false` evita que Cypress falle por el código de estado."

#### TC-NAV-15: Verificación de enlaces del Navbar
```javascript
it('TC-NAV-15: Debe tener enlaces a todas las secciones', () => {
  cy.get('nav').find('a[href="/"]').should('exist');
  cy.get('nav').find('a[href="/tasks"]').should('exist');
  cy.get('nav').find('a[href="/grades"]').should('exist');
  // ... 9 rutas en total
});
```
> "Este test verifica que el **Navbar contiene enlaces** a los 10 módulos del sistema. Es una prueba de integridad de la navegación."

---

## 📌 Cierre de la Persona 1:
> "En resumen, mis secciones cubren la **base del sistema**: cómo se autentica el usuario y cómo navega por la aplicación. Estos 34 tests son la **primera línea de defensa** para garantizar que el sistema es accesible y seguro. Ahora mi compañero/a explicará las pruebas de los módulos de gestión de datos."
