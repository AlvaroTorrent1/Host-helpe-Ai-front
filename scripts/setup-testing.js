/**
 * scripts/setup-testing.js
 * Script para configurar el entorno de testing para Host Helper AI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la salida en consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

console.log(`${colors.bright}${colors.blue}=== Configuración del Entorno de Testing para Host Helper AI ===${colors.reset}\n`);

// Verificar que el directorio de testing existe
const testsDir = path.join(__dirname, '..', 'src', 'tests');
const setupFile = path.join(testsDir, 'setup.ts');

if (!fs.existsSync(testsDir)) {
  console.log(`${colors.yellow}Creando directorio de tests...${colors.reset}`);
  fs.mkdirSync(testsDir, { recursive: true });
}

// Verificar que el archivo setup.ts existe
if (!fs.existsSync(setupFile)) {
  console.log(`${colors.yellow}Creando archivo setup.ts...${colors.reset}`);
  
  const setupContent = `/**
 * Global test configuration for the Host Helper AI application
 * This file is loaded before running tests
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
window.matchMedia =
  window.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Assign global mocks
window.ResizeObserver = ResizeObserverMock;

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([])
});

window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

// Suppress specific console errors during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React errors that appear during tests but not in real app
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
    'Warning: React does not recognize the'
  ];
  
  if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
    return;
  }
  
  originalConsoleError(...args);
};

// Utility to pause execution for a specific time (useful for testing async code)
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
`;

  fs.writeFileSync(setupFile, setupContent);
  console.log(`${colors.green}✓ Archivo setup.ts creado exitosamente${colors.reset}`);
} else {
  console.log(`${colors.green}✓ Archivo setup.ts ya existe${colors.reset}`);
}

// Crear estructura de directorios para tests
const directories = [
  path.join(testsDir, 'helpers'),
  path.join(testsDir, 'integration'),
  path.join(testsDir, 'unit')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`${colors.yellow}Creando directorio ${path.relative(process.cwd(), dir)}...${colors.reset}`);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`${colors.green}✓ Directorio creado${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Directorio ${path.relative(process.cwd(), dir)} ya existe${colors.reset}`);
  }
});

// Crear archivos de ejemplo si no existen
const exampleFiles = {
  [path.join(testsDir, 'helpers', 'supabaseMock.ts')]: `/**
 * Mock para el cliente Supabase en tests
 */

import { vi } from 'vitest';

// Factory para crear mocks de Supabase con diferentes respuestas
export const createSupabaseMock = (responseData = null, error = null) => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({
    data: responseData,
    error: error
  })
});

// Mock básico de Supabase con respuesta vacía
const supabaseMock = createSupabaseMock();

export default supabaseMock;
`,
  [path.join(testsDir, 'unit', 'example.test.ts')]: `/**
 * Ejemplo de test unitario
 */

import { describe, it, expect } from 'vitest';

describe('Ejemplo de test unitario', () => {
  it('debería realizar una suma correctamente', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });

  it('debería comprobar tipos correctamente', () => {
    const value = 'test';
    expect(typeof value).toBe('string');
  });
});
`
};

Object.entries(exampleFiles).forEach(([filePath, content]) => {
  if (!fs.existsSync(filePath)) {
    console.log(`${colors.yellow}Creando archivo ${path.relative(process.cwd(), filePath)}...${colors.reset}`);
    fs.writeFileSync(filePath, content);
    console.log(`${colors.green}✓ Archivo creado${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Archivo ${path.relative(process.cwd(), filePath)} ya existe${colors.reset}`);
  }
});

// Verificar que los scripts de testing están en package.json
try {
  console.log(`\n${colors.yellow}Verificando scripts de testing en package.json...${colors.reset}`);
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  let modified = false;
  
  if (!packageJson.scripts.test) {
    packageJson.scripts.test = 'vitest run';
    modified = true;
  }
  
  if (!packageJson.scripts['test:watch']) {
    packageJson.scripts['test:watch'] = 'vitest';
    modified = true;
  }
  
  if (!packageJson.scripts['test:coverage']) {
    packageJson.scripts['test:coverage'] = 'vitest run --coverage';
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`${colors.green}✓ Scripts de testing añadidos a package.json${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Scripts de testing ya existen en package.json${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error al verificar scripts en package.json: ${error.message}${colors.reset}`);
}

// Verificar dependencias de testing
try {
  console.log(`\n${colors.yellow}Verificando dependencias de testing...${colors.reset}`);
  
  const dependencies = [
    '@testing-library/react',
    '@testing-library/jest-dom',
    'vitest',
    'jsdom',
    '@vitest/coverage-c8'
  ];
  
  let missingDeps = [];
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  for (const dep of dependencies) {
    if (!packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log(`${colors.yellow}Faltan las siguientes dependencias: ${missingDeps.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Ejecuta el siguiente comando para instalarlas:${colors.reset}`);
    console.log(`npm install --save-dev ${missingDeps.join(' ')}`);
  } else {
    console.log(`${colors.green}✓ Todas las dependencias de testing están instaladas${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error al verificar dependencias: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.bright}${colors.green}¡Configuración de testing completada!${colors.reset}`);
console.log(`
Puedes ejecutar las pruebas con los siguientes comandos:
  ${colors.blue}npm test${colors.reset}            - Ejecuta todas las pruebas una vez
  ${colors.blue}npm run test:watch${colors.reset}  - Ejecuta las pruebas en modo observador
  ${colors.blue}npm run test:coverage${colors.reset} - Genera informe de cobertura
`); 