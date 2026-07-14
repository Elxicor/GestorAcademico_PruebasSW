import path from 'path';

export const config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',
    port: 4723,
    path: '/',

    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './mobile-tests/specs/**/*.spec.js'
    ],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Xiaomi 25078RA3EL',
        'appium:udid': 'G64HHU8P79OBEMRO',
        'appium:app': path.join(process.cwd(), './android/app/build/outputs/apk/debug/app-debug.apk'),
        'appium:appPackage': 'ec.edu.espe.studymate',
        'appium:appActivity': 'ec.edu.espe.studymate.MainActivity',
        'appium:newCommandTimeout': 240,
        'appium:autoGrantPermissions': true,
        'appium:ensureWebviewsHavePages': true,
        'appium:nativeWebScreenshot': true,
        'appium:noReset': false,
        'appium:fullReset': true
    }],

    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
