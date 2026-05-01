const fs = require('fs-extra');
const { execSync } = require('child_process');
const path = require('path');

async function buildExe() {
    try {
        console.log('1. Compilando aplicación Next.js...');
        // Ejecuta el build de next.js
        execSync('yarn build', { stdio: 'inherit' });

        console.log('2. Copiando archivos estáticos al directorio standalone...');
        const standaloneDir = path.join(__dirname, '.next', 'standalone');

        // El servidor Next.js standalone necesita tener acceso a public y .next/static
        const publicDest = path.join(standaloneDir, 'public');
        const staticDest = path.join(standaloneDir, '.next', 'static');

        if (fs.existsSync(path.join(__dirname, 'public'))) {
            fs.copySync(path.join(__dirname, 'public'), publicDest);
        }

        if (fs.existsSync(path.join(__dirname, '.next', 'static'))) {
            fs.copySync(path.join(__dirname, '.next', 'static'), staticDest);
        }

        console.log('3. Empaquetando con pkg...');
        // Ejecutar pkg. Usamos el server.js generado como punto de entrada.
        execSync('npx pkg .next/standalone/server.js --target node18-win-x64 --output RimAI.exe', { stdio: 'inherit' });

        console.log('¡Proceso completado exitosamente! Archivo RimAI.exe generado.');
    } catch (error) {
        console.error('Error durante la compilación a exe:', error);
        process.exit(1);
    }
}

buildExe();
