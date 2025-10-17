# 📦 Ejemplos de uso de useQueryCache

Guía práctica para implementar caché de API en componentes.

---

## 🎯 Caso 1: Lista de Propiedades

### Antes (sin caché):
```typescript
// PropertiesPage.tsx
import { useState, useEffect } from 'react';
import { propertyService } from '@services/propertyService';

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService.getProperties()
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  // Cada vez que entras a esta página, hace request a Supabase
}
```

### Después (con caché):
```typescript
// PropertiesPage.tsx
import { useQueryCache } from '@hooks/useQueryCache';
import { propertyService } from '@services/propertyService';

function PropertiesPage() {
  const { data: properties, loading, error } = useQueryCache({
    key: 'properties-list',
    queryFn: () => propertyService.getProperties(),
    ttl: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Primera vez: hace request
  // Siguientes veces (dentro de 5 min): usa cache ⚡
}
```

---

## 🎯 Caso 2: Detalles de una Propiedad

```typescript
// PropertyDetail.tsx
import { useQueryCache, invalidateCache } from '@hooks/useQueryCache';

function PropertyDetail({ propertyId }: { propertyId: string }) {
  // Incluye el ID en la clave para cachear por propiedad
  const { data: property, loading, refetch } = useQueryCache({
    key: `property-${propertyId}`,
    queryFn: () => propertyService.getPropertyById(propertyId),
    ttl: 10 * 60 * 1000, // 10 minutos
  });

  const handleUpdate = async (updates: any) => {
    await propertyService.updateProperty(propertyId, updates);
    
    // Invalida el cache de esta propiedad específica
    invalidateCache(`property-${propertyId}`);
    
    // También invalida la lista completa
    invalidateCache('properties-list');
    
    // Refetch para mostrar datos actualizados
    refetch();
  };

  return (
    <div>
      {loading ? <Spinner /> : <PropertyInfo data={property} />}
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Actualizar
      </button>
    </div>
  );
}
```

---

## 🎯 Caso 3: Reservaciones con Filtros

```typescript
// ReservationsPage.tsx
import { useQueryCache } from '@hooks/useQueryCache';
import { useState } from 'react';

function ReservationsPage() {
  const [filter, setFilter] = useState('all');

  // Diferentes claves de cache según el filtro
  const { data: reservations, loading } = useQueryCache({
    key: `reservations-${filter}`,
    queryFn: () => reservationService.getReservations(filter),
    ttl: 3 * 60 * 1000, // 3 minutos
  });

  // Cambiar filtro usa cache si ya se consultó antes
  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">Todas</option>
        <option value="active">Activas</option>
        <option value="past">Pasadas</option>
      </select>
      {loading ? <Spinner /> : <ReservationList data={reservations} />}
    </div>
  );
}
```

---

## 🎯 Caso 4: Refresh en Background

Mostrar datos cacheados inmediatamente, pero refrescar en background.

```typescript
import { useQueryCache } from '@hooks/useQueryCache';

function DashboardStats() {
  const { data: stats, loading } = useQueryCache({
    key: 'dashboard-stats',
    queryFn: () => dashboardService.getStats(),
    ttl: 5 * 60 * 1000,
    refetchInBackground: true, // 🔥 Refresca sin bloquear UI
  });

  // Primera carga: muestra loader
  // Siguientes cargas: muestra cache → actualiza silenciosamente
  
  return <StatsCard data={stats} isRefreshing={loading} />;
}
```

---

## 🎯 Caso 5: Limpiar Cache al Logout

```typescript
// AuthContext.tsx
import { clearCache } from '@hooks/useQueryCache';

export const AuthProvider = ({ children }) => {
  const logout = async () => {
    // Cerrar sesión
    await supabase.auth.signOut();
    
    // Limpiar todo el cache (importante para privacidad)
    clearCache();
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🎯 Caso 6: Invalidar Cache en Múltiples Componentes

Cuando creas/editas datos, invalida todos los caches relacionados.

```typescript
// PropertyForm.tsx
import { invalidateCache } from '@hooks/useQueryCache';

async function handleCreateProperty(data: PropertyData) {
  const newProperty = await propertyService.create(data);
  
  // Invalida múltiples caches relacionados
  invalidateCache('properties-list');
  invalidateCache('dashboard-stats');
  invalidateCache(`user-properties-${userId}`);
  
  toast.success('Propiedad creada');
}
```

---

## 🎯 Caso 7: Cache con Dependencias

Re-fetch automáticamente cuando cambia un parámetro.

```typescript
import { useQueryCache } from '@hooks/useQueryCache';
import { useEffect } from 'react';

function PropertyReservations({ propertyId }: { propertyId: string }) {
  const { data, loading, refetch } = useQueryCache({
    key: `property-reservations-${propertyId}`,
    queryFn: () => reservationService.getByProperty(propertyId),
    ttl: 2 * 60 * 1000,
  });

  // Re-fetch cuando cambia la propiedad
  useEffect(() => {
    refetch();
  }, [propertyId, refetch]);

  return <ReservationList data={data} loading={loading} />;
}
```

---

## 📊 Debugging del Cache

### Ver contenido del cache
```typescript
import { getCacheStats } from '@hooks/useQueryCache';

// En cualquier componente o consola
console.log('Cache stats:', getCacheStats());
// Output: { size: 5, keys: ['properties-list', 'reservations-all', ...] }
```

### Componente de Debug (Dev only)
```typescript
// components/CacheDebugPanel.tsx
import { getCacheStats, clearCache } from '@hooks/useQueryCache';
import { useState, useEffect } from 'react';

export function CacheDebugPanel() {
  const [stats, setStats] = useState(getCacheStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getCacheStats());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (import.meta.env.PROD) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#333', color: '#fff', padding: '10px', fontSize: '12px' }}>
      <div><strong>Cache Stats</strong></div>
      <div>Size: {stats.size}</div>
      <div>Keys: {stats.keys.join(', ')}</div>
      <button onClick={clearCache}>Clear All</button>
    </div>
  );
}
```

---

## ⚠️ Cuándo NO usar useQueryCache

1. **Datos que cambian constantemente** (cada segundo)
   - Usa polling normal o WebSockets
   
2. **Datos sensibles que no deben persistir**
   - Passwords, tokens, etc.
   
3. **Datos únicos por request**
   - No tiene sentido cachear algo que nunca se repite

4. **Mutations (POST, PUT, DELETE)**
   - El hook es solo para queries (GET)

---

## 🎓 Best Practices

### ✅ DO
- Usa claves descriptivas: `'properties-list'`, `'user-${userId}'`
- Invalida cache después de mutaciones
- Limpia cache en logout
- Usa TTL apropiado (3-10 minutos para datos que cambian poco)
- Refetch en background para UX fluido

### ❌ DON'T
- No uses claves dinámicas sin límite (`'random-${Math.random()}'`)
- No cachees datos sensibles
- No olvides invalidar después de updates
- No uses TTL muy largo (>30 min) para datos críticos
- No cachees errores (el hook ya lo maneja)

---

## 🧪 Testing

```typescript
// PropertyList.test.tsx
import { render, waitFor } from '@testing-library/react';
import { clearCache } from '@hooks/useQueryCache';

beforeEach(() => {
  clearCache(); // Limpiar cache antes de cada test
});

test('loads properties from cache', async () => {
  const { getByText } = render(<PropertiesList />);
  
  await waitFor(() => {
    expect(getByText('Property 1')).toBeInTheDocument();
  });
  
  // Cache stats
  const stats = getCacheStats();
  expect(stats.keys).toContain('properties-list');
});
```

---

**Última actualización**: Octubre 2025

