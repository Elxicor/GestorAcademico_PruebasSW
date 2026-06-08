# 🎤 Guion de Exposición — Persona 2

## Tema: Tests de Tareas, Materias y Calificaciones

---

## 📌 Parte 1: Test Suite de Tareas — `tasks.cy.js` (5 minutos)

### Qué decir:
> "Yo les explicaré las pruebas de los tres módulos de gestión de datos: **Tareas, Materias y Calificaciones**. Empiezo con el módulo de Tareas."

> "El archivo `tasks.cy.js` contiene **11 casos de prueba** organizados en 3 bloques: Visualización, Crear Tarea (válido) y Crear Tarea (erróneo), más operaciones de ordenamiento."

### Explicar la estructura del beforeEach:
```javascript
beforeEach(() => {
  cy.loginMock();
  cy.wait(500);
});
```
> "Antes de cada test, ejecutamos `cy.loginMock()` — nuestro comando custom que intercepta Supabase y simula una sesión activa. El `cy.wait(500)` da tiempo al renderizado de React. Esto demuestra el uso correcto de **hooks de Cypress** y **comandos personalizados**."

### TC-TASK-04: Abrir formulario
```javascript
it('TC-TASK-04: Debe abrir el formulario de nueva tarea', () => {
  cy.visit('/tasks');
  cy.get('button').contains('Nueva Tarea').click();
  cy.contains('Nueva Tarea').should('be.visible');
  cy.get('input[placeholder="Ingresa el título de la tarea"]').should('be.visible');
});
```
> "Usamos `cy.get('button').contains()` para localizar el botón por su texto, luego `.click()` para simular la interacción del usuario, y finalmente `.should('be.visible')` para verificar que el modal se abrió correctamente. Es un patrón **acción → verificación** clásico de Cypress."

### TC-TASK-05: Crear tarea exitosamente
```javascript
it('TC-TASK-05: Debe crear una tarea con datos válidos', () => {
  cy.visit('/tasks');
  cy.get('button').contains('Nueva Tarea').click();
  cy.get('input[placeholder="Ingresa el título de la tarea"]').type('Tarea de prueba Cypress');
  cy.get('textarea[placeholder="Ingresa la descripción de la tarea"]').type('Descripción automatizada');
  cy.get('button').contains('Crear Tarea').click();
  cy.get('input[placeholder="Ingresa el título de la tarea"]').should('not.exist');
});
```
> "Este test simula el **flujo completo** de creación: abrir formulario → llenar campos con `.type()` → enviar con `.click()` → verificar que el modal se cerró (el input ya no existe). Esto es un **caso válido** donde todos los datos son correctos."

### TC-TASK-08: Error sin título (caso erróneo)
```javascript
it('TC-TASK-08: No debe crear tarea sin título', () => {
  cy.visit('/tasks');
  cy.get('button').contains('Nueva Tarea').click();
  cy.get('textarea[placeholder="Ingresa la descripción de la tarea"]').type('Solo descripción');
  cy.get('button').contains('Crear Tarea').click();
  cy.get('input[placeholder="Ingresa el título de la tarea"]').should('be.visible');
});
```
> "Este es el **caso erróneo complementario**: intentamos crear una tarea sin título. Verificamos que el formulario **no se cierra** (el input sigue visible), lo que demuestra que la validación funciona."

### TC-TASK-09 al 11: Ordenamiento
```javascript
it('TC-TASK-09: Debe poder ordenar por Materia', () => {
  cy.visit('/tasks');
  cy.contains('button', 'Materia').click();
  cy.contains('button', 'Materia').should('exist');
});
```
> "Probamos que los botones de **ordenamiento** funcionan: al hacer clic en Materia, Fecha Límite o Prioridad, la interfaz responde. Usamos el selector `cy.contains('button', 'texto')` que combina tipo de elemento con texto."

---

## 📌 Parte 2: Test Suite de Materias — `subjects.cy.js` (4 minutos)

### Qué decir:
> "Las materias son la **columna vertebral** del sistema. Tareas, calificaciones, horario y apuntes dependen de las materias registradas. El archivo `subjects.cy.js` tiene **10 casos de prueba**."

### TC-SUB-05: Crear materia exitosamente
```javascript
it('TC-SUB-05: Debe crear una materia con datos válidos', () => {
  cy.visit('/subjects');
  cy.get('button').contains('Gestionar Materias').click();
  cy.get('input[placeholder="Ingresa el nombre de la materia"]').type('Pruebas de Software');
  cy.get('button').contains('Añadir Materia').click();
  cy.contains('Pruebas de Software').should('be.visible');
});
```
> "Este es un test **end-to-end completo**: navegamos a la página, abrimos el modal, escribimos el nombre y verificamos que la materia aparece en la lista. La assertion `cy.contains('Pruebas de Software').should('be.visible')` confirma que el **estado de la UI se actualizó**."

### TC-SUB-06: Selección de color
```javascript
it('TC-SUB-06: Debe permitir seleccionar un color para la materia', () => {
  cy.visit('/subjects');
  cy.get('button').contains('Gestionar Materias').click();
  cy.get('button[style*="background-color"]').should('have.length.at.least', 5);
  cy.get('button[style*="background-color"]').eq(2).click();
});
```
> "Aquí usamos el **selector CSS por atributo** `[style*="background-color"]` para encontrar los botones de color. Verificamos que hay al menos 5 opciones y hacemos clic en una. Esto demuestra el uso de **selectores avanzados** en Cypress."

### TC-SUB-09: Error sin nombre
```javascript
it('TC-SUB-09: No debe crear materia sin nombre', () => {
  cy.visit('/subjects');
  cy.get('button').contains('Gestionar Materias').click();
  cy.get('button').contains('Añadir Materia').click();
  cy.get('input[placeholder="Ingresa el nombre de la materia"]').should('be.visible');
});
```
> "Caso erróneo: intentar añadir sin nombre. El formulario permanece abierto, demostrando que la **validación del lado del cliente** funciona correctamente."

---

## 📌 Parte 3: Test Suite de Calificaciones — `grades.cy.js` (5 minutos)

### Qué decir:
> "El módulo de Calificaciones es **nuevo**, lo agregamos nosotros. Es crítico porque calcula promedios ponderados y determina el estado aprobado/reprobado. Tiene **14 casos de prueba** — el más extenso después de autenticación."

### TC-GRD-03: Verificación del formulario
```javascript
it('TC-GRD-03: Debe abrir el formulario de nueva calificación', () => {
  cy.visit('/grades');
  cy.get('[data-cy="btn-add-grade"]').click();
  cy.contains('Nueva Calificación').should('be.visible');
  cy.get('[data-cy="grade-form"]').should('be.visible');
  cy.get('[data-cy="grade-exam-name"]').should('be.visible');
  cy.get('[data-cy="grade-score"]').should('be.visible');
  cy.get('[data-cy="grade-weight"]').should('be.visible');
});
```
> "Noten que aquí usamos **selectores `data-cy`** en lugar de clases CSS o placeholders. Esto es una **best practice de Cypress**: los atributos `data-cy` son estables, no cambian con el diseño visual, y hacen los tests más mantenibles."

### TC-GRD-08: Nota mayor al máximo (error)
```javascript
it('TC-GRD-08: No debe aceptar nota mayor a la nota máxima', () => {
  cy.visit('/grades');
  cy.get('[data-cy="btn-add-grade"]').click();
  cy.get('[data-cy="grade-exam-name"]').type('Test');
  cy.get('[data-cy="grade-score"]').type('15'); // Mayor que 10
  cy.get('[data-cy="grade-max-score"]').clear().type('10');
  cy.get('[data-cy="grade-weight"]').type('30');
  cy.get('[data-cy="btn-submit-grade"]').click();
  cy.get('[data-cy="error-score"]').should('be.visible');
});
```
> "Este es un **caso erróneo de validación de rango**: ingresamos 15 como nota cuando el máximo es 10. El sistema muestra un mensaje de error usando el selector `[data-cy="error-score"]`. Esto valida que la **lógica de negocio** (nota ≤ máxima) está implementada correctamente."

### TC-GRD-10: Peso mayor a 100 (error)
```javascript
it('TC-GRD-10: No debe aceptar peso mayor a 100', () => {
  cy.get('[data-cy="grade-weight"]').type('150');
  cy.get('[data-cy="btn-submit-grade"]').click();
  cy.get('[data-cy="error-weight"]').should('be.visible');
  cy.get('[data-cy="error-weight"]').should('contain', 'entre 1 y 100');
});
```
> "Otro caso erróneo: peso de 150%. Verificamos no solo que el error **se muestra**, sino también que el **texto del error es correcto** con `.should('contain', 'entre 1 y 100')`. Esto es una assertion más fuerte que solo verificar visibilidad."

### TC-GRD-12: Sin materia seleccionada
```javascript
it('TC-GRD-12: No debe crear sin materia seleccionada', () => {
  // No seleccionar materia
  cy.get('[data-cy="btn-submit-grade"]').click();
  cy.get('[data-cy="error-subject"]').should('be.visible');
  cy.get('[data-cy="error-subject"]').should('contain', 'obligatoria');
});
```
> "Probamos que **cada campo obligatorio** tiene su propio mensaje de error. Esto garantiza una experiencia de usuario clara donde el estudiante sabe exactamente qué campo falta."

---

## 📌 Cierre de la Persona 2:
> "En resumen, mis 3 suites cubren la **gestión de datos académicos**: crear, editar, validar y eliminar tareas, materias y calificaciones. Los **35 tests** combinan selectores por ID, texto, CSS y `data-cy`, demostrando dominio de la API de Cypress. Ahora mi compañero/a cerrará con los módulos restantes."
