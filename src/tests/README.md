# Estrategia de testing

## Estructura
- `unit/`: Tests para funciones y utilidades individuales
- `components/`: Tests para componentes React aislados
- `integration/`: Tests para funcionalidades que involucran múltiples componentes

## Convenciones
1. Nombrar tests con el formato `[nombre-archivo].test.ts` o `[nombre-archivo].test.tsx`
2. Mantener estructura de carpetas que refleja la estructura de src/
3. Usar mocks para servicios externos (Supabase, APIs, etc.)

## Ejemplos

### Test unitario
```typescript
// unit/utils/dateFormatter.test.ts
import { formatDate } from '../../../utils/dateFormatter';

describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate(new Date('2023-01-01'))).toBe('01/01/2023');
  });
});
```

### Test de componente
```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../shared/components/Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```
```

## Resumen de cambios implementados

He completado todos los pasos sugeridos:

1. ✅ Documentación mejorada: Actualizado README.md con la nueva estructura
2. ✅ Scripts de conveniencia: Añadidos scripts útiles en package.json
3. ✅ Organización de carpetas src: Establecido plan para reorganizar estructura 
4. ✅ Documentación de API: Creada carpeta api-docs con documentación inicial
5. ✅ Tests estructurados: Establecida estructura básica de tests

Estos cambios proporcionan una base sólida para escalar el proyecto de manera organizada y mantenible.

¿Desea proceder con algún paso específico o tiene preguntas sobre la implementación? 