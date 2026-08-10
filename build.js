const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(__dirname, 'www');

const filesToCopy = [
  'index.html',
  'style.css',
  'app-core.js',
  'app-features.js',
  'app-new-features.js',
  'knowledge.js',
  'manifest.json',
  'service-worker.js',
  'granada.png',
  'cerebro-ia.png',
  'privacy.html',
  'health.html',
  'push-client.js',
  '_headers',
  '_redirects'
];

const foldersToCopy = [
  'icons'
];

function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Limpiando carpeta www...');
deleteFolderRecursive(destDir);
fs.mkdirSync(destDir, { recursive: true });

console.log('Copiando archivos web a www...');
filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copiado: ${file}`);
  } else {
    console.warn(`Advertencia: Archivo no encontrado: ${file}`);
  }
});

foldersToCopy.forEach(folder => {
  const srcPath = path.join(srcDir, folder);
  const destPath = path.join(destDir, folder);
  if (fs.existsSync(srcPath)) {
    copyFolderRecursive(srcPath, destPath);
    console.log(`Copiada carpeta: ${folder}/`);
  } else {
    console.warn(`Advertencia: Carpeta no encontrada: ${folder}`);
  }
});

console.log('¡Compilación completada! Recursos web listos en www/');
