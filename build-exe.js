const fs = require('fs-extra');
const { execSync } = require('child_process');
const path = require('path');

async function buildPortable() {
    try {
        console.log('1. Compilando aplicación Next.js...');
        // Ejecuta el build de next.js
        execSync('yarn build', { stdio: 'inherit' });

        console.log('2. Preparando la carpeta portable...');
        const portableDir = path.join(__dirname, 'RimAI_Portable');
        
        // Limpiamos la carpeta si ya existe
        if (fs.existsSync(portableDir)) {
            fs.removeSync(portableDir);
        }
        fs.ensureDirSync(portableDir);

        console.log('3. Copiando archivos del servidor standalone...');
        const standaloneDir = path.join(__dirname, '.next', 'standalone');
        
        // Copiar todo lo de standalone a la raíz de la carpeta portable
        fs.copySync(standaloneDir, portableDir);

        // El servidor Next.js standalone necesita tener acceso a public y .next/static
        const publicDest = path.join(portableDir, 'public');
        const staticDest = path.join(portableDir, '.next', 'static');

        if (fs.existsSync(path.join(__dirname, 'public'))) {
            fs.copySync(path.join(__dirname, 'public'), publicDest);
        }

        if (fs.existsSync(path.join(__dirname, '.next', 'static'))) {
            fs.copySync(path.join(__dirname, '.next', 'static'), staticDest);
        }

        console.log('4. Descargando motor portable de Node.js (v18.19.1)...');
        // Descargamos un node.exe oficial para Windows (x64)
        const nodeExePath = path.join(portableDir, 'node.exe');
        execSync(`curl.exe -L -o "${nodeExePath}" "https://nodejs.org/dist/v18.19.1/win-x64/node.exe"`, { stdio: 'inherit' });

        console.log('5. Creando script de inicio (.bat)...');
        const batContent = `@echo off
TITLE RimAI Server
echo ==============================================
echo Iniciando el servidor seguro de RimAI...
echo ==============================================
echo.
echo Por favor, NO cierres esta ventana negra.
echo Abre tu navegador y ve a: http://localhost:3000
echo.
node.exe server.js
pause`;
        fs.writeFileSync(path.join(portableDir, 'Iniciar-RimAI.bat'), batContent);

        console.log('\\n======================================================');
        console.log('¡Proceso completado exitosamente!');
        console.log('Se ha creado la carpeta "RimAI_Portable".');
        console.log('Puedes copiar esa carpeta completa a la otra PC y hacer');
        console.log('doble clic en "Iniciar-RimAI.bat" para usar la app.');
        console.log('======================================================\\n');
    } catch (error) {
        console.error('Error durante la compilación:', error);
        process.exit(1);
    }
}

buildPortable();
