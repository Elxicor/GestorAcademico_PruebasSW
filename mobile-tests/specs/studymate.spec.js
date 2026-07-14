describe('Estudios y Tareas - Pruebas E2E en Celular Android', () => {
    const artifactDir = 'C:/Users/ERICK/.gemini/antigravity-ide/brain/3f7b43eb-7ec0-4cf7-a315-39a3e7517aa4';

    // Helper para capturar pantalla y log de depuración
    async function takeDebugSnapshot(name) {
        try {
            const url = await browser.getUrl();
            console.log(`[DEBUG SNAPSHOT - ${name}] URL actual: ${url}`);
            
            // Guardar captura de pantalla en el directorio de artefactos
            await browser.saveScreenshot(`${artifactDir}/${name}.png`);
            console.log(`[DEBUG SNAPSHOT - ${name}] Captura guardada como ${name}.png`);

            // Imprimir estructura simplificada del DOM
            const body = await $('body');
            if (await body.isDisplayed()) {
                const html = await body.getHTML(false);
                console.log(`[DEBUG SNAPSHOT - ${name}] HTML del Body (primeros 500 chars): ${html.substring(0, 500)}`);
            }
        } catch (e) {
            console.log(`[DEBUG SNAPSHOT - ${name}] Error al capturar: ${e.message}`);
        }
    }
    
    // Función auxiliar para inyectar una sesión de prueba en LocalStorage
    async function injectMockSession() {
        const key = 'sb-yaiynnuupdcltwfvbgvd-auth-token';
        const fakeSession = {
            access_token: 'fake-access-token-12345',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'fake-refresh-token-12345',
            user: {
                id: 'test-user-id-123',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'test@espe.edu.ec',
                email_confirmed_at: '2026-03-10T10:00:00Z',
                confirmed_at: '2026-03-10T10:00:00Z',
                last_sign_in_at: '2026-03-10T10:00:00Z',
                app_metadata: {
                    provider: 'email',
                    providers: ['email']
                },
                user_metadata: {
                    name: 'Estudiante Test'
                },
                created_at: '2026-03-10T10:00:00Z',
                updated_at: '2026-03-10T10:00:00Z'
            },
            expires_at: Math.floor(Date.now() / 1000) + 3600
        };

        // Inyectar el token en el LocalStorage de la WebView
        await browser.execute((k, s) => {
            localStorage.setItem(k, JSON.stringify(s));
        }, key, fakeSession);

        // Recargar la app para que tome la nueva sesión activa
        await browser.url('https://localhost/');
        await browser.pause(4000);
    }

    // Clic mediante JavaScript para evitar interferencias de Toasts o modals
    async function jsClick(element) {
        await browser.execute(el => el.click(), element);
    }

    before(async () => {
        // Esperar a que el contexto del WebView esté listo en el celular
        await browser.waitUntil(async () => {
            const contexts = await browser.getContexts();
            return contexts.length > 1;
        }, { timeout: 25000, timeoutMsg: 'El contexto del WebView de Android no fue encontrado.' });

        // Obtener el contexto del WebView y cambiarse a él
        const contexts = await browser.getContexts();
        const webviewContext = contexts.find(c => c.includes('WEBVIEW'));
        await browser.switchContext(webviewContext);
    });

    afterEach(async function() {
        // Si el test falló, tomar captura de pantalla de inmediato
        if (this.currentTest.state === 'failed') {
            await takeDebugSnapshot(`fail_${this.currentTest.title.replace(/\s+/g, '_')}`);
        }
    });

    // ==========================================
    // 1. MÓDULO DE AUTENTICACIÓN
    // ==========================================
    describe('Flujo de Autenticación', () => {
        it('Debe cargar la pantalla de inicio de sesión correctamente', async () => {
            const emailInput = await $('#email');
            const passwordInput = await $('#password');
            await expect(emailInput).toBeDisplayed();
            await expect(passwordInput).toBeDisplayed();
        });

        it('Debe iniciar sesión inyectando el token de sesión simulado', async () => {
            await injectMockSession();
            await takeDebugSnapshot('after_login_injection');

            // Verificar que cargó la app autenticada y que no estamos en el login
            const currentUrl = await browser.getUrl();
            expect(currentUrl).not.toContain('/login');
            expect(currentUrl).not.toContain('/signup');
        });
    });

    // ==========================================
    // 2. MÓDULO DE TAREAS
    // ==========================================
    describe('Gestión de Tareas', () => {
        it('Debe navegar a la sección de tareas y crear una nueva tarea', async () => {
            // Ir al módulo de tareas usando jsClick
            const tasksLink = await $('nav a[href="/tasks"]');
            await jsClick(tasksLink);
            await browser.pause(2000);

            await takeDebugSnapshot('after_tasks_nav');

            // Verificar de forma robusta que estamos en la sección de tareas
            const title = await $('main h1');
            await title.waitForDisplayed({ timeout: 5000 });
            await browser.waitUntil(async () => {
                const txt = await title.getText();
                return txt.includes('Tareas');
            }, { timeout: 10000, timeoutMsg: 'El título Tareas no cargó a tiempo.' });

            // Abrir formulario modal usando jsClick
            const newTaskBtn = await $('button=Nueva Tarea');
            await jsClick(newTaskBtn);
            await browser.pause(1000);

            // Rellenar formulario
            const taskTitleInput = await $('input[placeholder="Ingresa el título de la tarea"]');
            await taskTitleInput.setValue('Estudiar para examen de Móviles');

            const taskDescInput = await $('textarea[placeholder="Ingresa la descripción de la tarea"]');
            await taskDescInput.setValue('Repasar comandos de Appium y WebdriverIO');

            const submitTaskBtn = await $('button[type="submit"]');
            await jsClick(submitTaskBtn);

            // Esperar que guarde y actualice la lista
            await browser.pause(2000);

            // Verificar la existencia de la nueva tarea
            const taskItem = await $('h3=Estudiar para examen de Móviles');
            await expect(taskItem).toBeDisplayed();
        });

        it('Debe permitir marcar la tarea creada como completada', async () => {
            // Buscar el botón circular de completar para la tarea específica creada
            const completeBtn = await $('//h3[text()="Estudiar para examen de Móviles"]/../preceding-sibling::button');
            await jsClick(completeBtn);
            await browser.pause(1500);

            // Validar que el texto se muestre tachado (clase line-through en el h3)
            const taskTitleHeader = await $('h3=Estudiar para examen de Móviles');
            const classAttribute = await taskTitleHeader.getAttribute('class');
            expect(classAttribute).toContain('line-through');
        });
    });

    // ==========================================
    // 3. MÓDULO DE APUNTES
    // ==========================================
    describe('Gestión de Apuntes', () => {
        it('Debe navegar a la sección de apuntes y guardar una nota de estudio', async () => {
            // Ir al módulo de notas usando jsClick
            const notesLink = await $('nav a[href="/notes"]');
            await jsClick(notesLink);
            await browser.pause(2000);

            // Crear nuevo apunte usando jsClick
            const newNoteBtn = await $('button=Nuevo Apunte');
            await jsClick(newNoteBtn);
            await browser.pause(1000);

            // Rellenar formulario
            const noteTitleInput = await $('input[placeholder="Título del apunte"]');
            await noteTitleInput.setValue('Notas sobre Capacitor');

            const noteContentInput = await $('textarea[placeholder="Escribe tu apunte aquí..."]');
            await noteContentInput.setValue('Capacitor permite empaquetar aplicaciones web para iOS y Android de forma nativa.');

            const saveNoteBtn = await $('button[type="submit"]');
            await jsClick(saveNoteBtn);

            // Esperar guardado
            await browser.pause(2000);

            // Verificar en la interfaz
            const noteCardTitle = await $('h3=Notas sobre Capacitor');
            await expect(noteCardTitle).toBeDisplayed();
        });
    });

    // ==========================================
    // 4. MÓDULO DE PERFIL Y CIERRE DE SESIÓN
    // ==========================================
    describe('Perfil del Estudiante y Cierre de Sesión', () => {
        it('Debe navegar al perfil, mostrar datos y permitir cerrar sesión', async () => {
            // Ir al módulo de perfil usando jsClick
            const profileLink = await $('nav a[href="/profile"]');
            await jsClick(profileLink);
            await browser.pause(2000);

            // Verificar de forma robusta la vista de perfil
            const profileHeader = await $('h1=Perfil del Estudiante');
            await profileHeader.waitForDisplayed({ timeout: 5000 });

            // Dar click en el botón de logout móvil usando jsClick
            const logoutBtn = await $('#logout-button');
            await logoutBtn.waitForDisplayed({ timeout: 5000 });
            await jsClick(logoutBtn);

            // Esperar que procese el logout
            await browser.pause(3000);

            // Verificar retorno al Login
            const loginHeader = await $('h2=Bienvenido de nuevo');
            await loginHeader.waitForDisplayed({ timeout: 5000 });
            await expect(loginHeader).toBeDisplayed();
        });
    });
});
