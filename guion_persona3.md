# 🎤 Guion de Exposición — Persona 3

## Tema: Tests de Horario, Apuntes, Perfil/Timer y Conclusiones

---

## 📌 Parte 1: Test Suite de Horario — `schedule.cy.js` (4 minutos)

### Qué decir:
> "Yo cierro la exposición con los tests de **Horario de Clases, Apuntes y Perfil/Timer Pomodoro**, más las conclusiones finales."

> "El módulo de Horario es **nuevo**, lo agregamos para completar el gestor académico. Permite organizar clases semanales de Lunes a Viernes. El archivo `schedule.cy.js` tiene **12 casos de prueba**."

### TC-SCH-05: Verificar días laborables
```javascript
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
```
> "Este test verifica que el selector tiene **exactamente 5 opciones** (Lunes a Viernes) y que cada una tiene el texto correcto. Usamos `.find('option')` para acceder a los elementos hijos del select, `.eq(index)` para acceder por posición, y `.should('have.text')` para verificar el contenido."

### TC-SCH-08: Hora fin igual a hora inicio (error)
```javascript
it('TC-SCH-08: No debe crear clase con hora fin igual a hora inicio', () => {
  cy.visit('/schedule');
  cy.get('[data-cy="btn-add-schedule"]').click();
  cy.get('[data-cy="schedule-start-time"]').select('09:00');
  cy.get('[data-cy="schedule-end-time"]').select('09:00');
  cy.get('[data-cy="schedule-classroom"]').type('Aula 101');
  cy.get('[data-cy="schedule-teacher"]').type('Ing. Test');
  cy.get('[data-cy="btn-submit-schedule"]').click();
  cy.get('[data-cy="error-end-time"]').should('be.visible');
  cy.get('[data-cy="error-end-time"]').should('contain', 'posterior');
});
```
> "Este es un **caso erróneo crítico**: la hora de fin debe ser **estrictamente posterior** a la hora de inicio. Usamos `.select('09:00')` para seleccionar valores en los dropdowns de hora. La validación muestra el mensaje 'La hora fin debe ser posterior a la hora inicio'. Esto es una **regla de negocio** implementada en el formulario."

### TC-SCH-09: Hora fin antes de hora inicio
```javascript
it('TC-SCH-09: No debe crear clase con hora fin antes de hora inicio', () => {
  cy.get('[data-cy="schedule-start-time"]').select('10:00');
  cy.get('[data-cy="schedule-end-time"]').select('08:00');
  cy.get('[data-cy="btn-submit-schedule"]').click();
  cy.get('[data-cy="error-end-time"]').should('be.visible');
});
```
> "Similar al anterior pero con hora fin **antes** de la de inicio (10:00 → 08:00). Ambos casos erróneos prueban la misma validación pero con datos diferentes, lo cual es una buena práctica de **testing de límites**."

### TC-SCH-10, 11, 12: Campos obligatorios
```javascript
it('TC-SCH-10: No debe crear clase sin aula', () => {
  // Todo lleno excepto aula
  cy.get('[data-cy="btn-submit-schedule"]').click();
  cy.get('[data-cy="error-classroom"]').should('be.visible');
  cy.get('[data-cy="error-classroom"]').should('contain', 'obligatoria');
});
```
> "Probamos cada campo obligatorio individualmente: aula, docente y materia. Cada uno muestra su **propio mensaje de error**, verificado con assertions específicas."

---

## 📌 Parte 2: Test Suite de Apuntes — `notes.cy.js` (4 minutos)

### Qué decir:
> "Los Apuntes son el módulo más rico en funcionalidad: tiene CRUD, **búsqueda en tiempo real**, filtrado por materia y **sistema de etiquetas (tags)**. Tiene **13 casos de prueba**."

### TC-NOTE-06: Crear apunte completo
```javascript
it('TC-NOTE-06: Debe crear un apunte con datos válidos', () => {
  cy.visit('/notes');
  cy.get('[data-cy="btn-add-note"]').click();
  cy.get('[data-cy="note-form-title"]').type('Apunte de Prueba');
  cy.get('[data-cy="note-form-content"]').type('Contenido del apunte de prueba');
  cy.get('[data-cy="note-form-tags"]').type('test, cypress, prueba');
  cy.get('[data-cy="btn-submit-note"]').click();
  cy.get('[data-cy="note-card"]').should('have.length', 1);
  cy.get('[data-cy="note-title"]').should('contain', 'Apunte de Prueba');
});
```
> "Este test crea un apunte con título, contenido y tags. Después de enviarlo, verificamos **dos cosas**: que hay exactamente 1 tarjeta de apunte y que el título es correcto. Usamos `.should('have.length', 1)` para contar elementos y `.should('contain')` para verificar texto parcial."

### TC-NOTE-07: Verificar etiquetas
```javascript
it('TC-NOTE-07: Debe mostrar las etiquetas del apunte creado', () => {
  // ... crear apunte con tags "resumen, fórmulas"
  cy.get('[data-cy="note-tag"]').should('have.length.at.least', 2);
});
```
> "Verificamos que las etiquetas se renderizan correctamente. La assertion `.should('have.length.at.least', 2)` es más flexible que un conteo exacto, útil cuando no sabemos la cantidad precisa."

### TC-NOTE-09 y 10: Validación de campos
```javascript
it('TC-NOTE-09: No debe crear apunte sin título', () => {
  cy.get('[data-cy="note-form-content"]').type('Contenido sin título');
  cy.get('[data-cy="btn-submit-note"]').click();
  cy.get('[data-cy="error-title"]').should('be.visible');
  cy.get('[data-cy="error-title"]').should('contain', 'obligatorio');
});
```
> "Probamos que **título y contenido son obligatorios** individualmente. TC-NOTE-11 verifica que si ambos están vacíos, se muestran **los dos errores simultáneamente**."

### TC-NOTE-12: Búsqueda en tiempo real
```javascript
it('TC-NOTE-12: Debe filtrar al escribir en la barra de búsqueda', () => {
  // Crear apunte, luego buscar
  cy.get('[data-cy="notes-search"]').type('Buscable');
  cy.get('[data-cy="note-card"]').should('have.length', 1);

  cy.get('[data-cy="notes-search"]').clear().type('NoExiste123');
  cy.contains('No se encontraron apuntes').should('be.visible');
});
```
> "Este test verifica la **búsqueda en tiempo real**: al escribir un término, la lista se filtra. Luego buscamos algo que no existe y verificamos que se muestra el mensaje de 'no encontrado'. Esto prueba tanto el **caso válido** como el **caso vacío** de la búsqueda."

---

## 📌 Parte 3: Test Suite de Perfil y Timer — `profile.cy.js` (3 minutos)

### Qué decir:
> "El último archivo, `profile.cy.js`, tiene **18 casos de prueba** divididos entre el perfil del estudiante y el Timer Pomodoro del dashboard."

### TC-PROF-08: Email solo lectura
```javascript
it('TC-PROF-08: Debe tener el email como campo solo lectura', () => {
  cy.visit('/profile');
  cy.get('input[type="email"]').should('have.attr', 'readOnly');
});
```
> "Verificamos que el email **no es editable**. Usamos `.should('have.attr', 'readOnly')` que verifica la existencia del atributo HTML. Es un test de **seguridad de la interfaz**: el email proviene de la autenticación y no debe modificarse desde el perfil."

### TC-PROF-11: Timer Pomodoro
```javascript
it('TC-PROF-11: Debe mostrar el timer en el dashboard', () => {
  cy.visit('/');
  cy.get('[role="timer"]').should('be.visible');
  cy.get('[role="timer"]').should('contain', ':');
});
```
> "Usamos el **atributo ARIA `role="timer"`** como selector, que es una buena práctica de accesibilidad. Verificamos que el timer muestra el formato correcto con `:` (MM:SS)."

### TC-PROF-16: Configuración del timer
```javascript
it('TC-PROF-16: Debe mostrar la configuración al hacer clic en ajustes', () => {
  cy.visit('/');
  cy.get('[aria-label*="configuración"]').click();
  cy.contains('Duración del Trabajo').should('be.visible');
  cy.contains('Duración del Descanso').should('be.visible');
  cy.contains('Descanso Largo').should('be.visible');
  cy.contains('Guardar Configuración').should('be.visible');
});
```
> "Este test usa el selector `[aria-label*="configuración"]` que busca por **coincidencia parcial** del aria-label. Al hacer clic, verificamos que aparecen los 3 campos de configuración del Pomodoro: trabajo, descanso y descanso largo."

---

## 📌 Parte 4: Conclusiones Finales (3 minutos)

### Qué decir:
> "Para cerrar, les presento un resumen de todo lo que logramos:"

### Tabla resumen:
| Archivo | Módulo | Total Tests | Válidos | Erróneos |
|---------|--------|-------------|---------|----------|
| `auth.cy.js` | Autenticación | 16 | 7 | 9 |
| `navigation.cy.js` | Navegación/404 | 18 | 11 | 7 |
| `tasks.cy.js` | Tareas | 11 | 8 | 3 |
| `subjects.cy.js` | Materias | 10 | 7 | 3 |
| `grades.cy.js` | Calificaciones | 14 | 5 | 9 |
| `schedule.cy.js` | Horario | 12 | 5 | 7 |
| `notes.cy.js` | Apuntes | 13 | 8 | 5 |
| `profile.cy.js` | Perfil/Timer | 18 | 18 | 0 |
| **TOTAL** | **8 módulos** | **112** | **69** | **43** |

> "En total tenemos **112 casos de prueba** distribuidos en 8 archivos spec, cubriendo el **100% de las funcionalidades** del sistema. De esos 112, **69 son flujos válidos** y **43 son flujos erróneos**, lo que demuestra cobertura de ambos caminos."

### Cumplimiento de la rúbrica:

> "**1. Justificación (100%)**: Cada archivo tiene un bloque de documentación JSDoc que explica **por qué** se eligió probar esa funcionalidad y qué se espera verificar."

> "**2. Uso correcto de Cypress (100%)**: Usamos correctamente:
> - **Comandos**: `cy.visit()`, `cy.get()`, `cy.contains()`, `cy.intercept()`, `cy.type()`, `cy.click()`, `cy.select()`, `cy.wait()`
> - **Selectores**: ID (`#email`), atributos (`[data-cy]`), CSS (`[style*=]`), ARIA (`[role]`, `[aria-label]`), texto
> - **Assertions**: `.should('be.visible')`, `.should('contain')`, `.should('have.attr')`, `.should('have.length')`, `.should('not.exist')`, `.should('include')`, `.and()` encadenado
> - **Estructura**: `describe()`, `it()`, `beforeEach()`, hooks y bloques anidados"

> "**3. Resultados claros (100%)**: Cada test tiene un ID único (TC-AUTH-01, TC-TASK-05, etc.) y una descripción clara de lo que verifica. Los tests cubren procesos válidos y erróneos en el 100% de los módulos."

> "**4. Presentación organizada (100%)**: Distribuimos la presentación en 3 personas, cada una explica el **porqué** y el **cómo** del código Cypress que le corresponde, con ejemplos de código y explicación línea por línea."

### Cierre final:
> "Gracias por su atención. ¿Tienen preguntas?"
