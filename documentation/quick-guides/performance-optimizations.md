# 🚀 Guía de Optimizaciones de Performance

## Fecha de implementación: Octubre 2025

Esta guía documenta todas las optimizaciones de performance implementadas en el proyecto para mejorar la velocidad de carga y experiencia del usuario.

---

## 📊 Resumen de Mejoras Implementadas

| Optimización | Impacto | Beneficio Esperado |
|--------------|---------|-------------------|
| 🖼️ Optimización de imágenes | Alto | 50-70% reducción de tamaño |
| 📦 Bundle splitting | Medio | Mejor caching del navegador |
| 💾 Caché de API | Alto | Menos llamadas a Supabase |
| 📈 Performance monitoring | Alto | Visibilidad de métricas reales |
| ⚡ Optimización de formularios | Medio | Menos re-renders |
| 🗜️ Compresión GZIP/Brotli | Bajo | 30% menos transferencia |
| 🔀 Code splitting adicional | Medio | Bundle inicial más pequeño |

---

## 1️⃣ OPTIMIZACIÓN DE IMÁGENES

### ¿Qué hace?
Convierte automáticamente las imágenes a WebP y las comprime al hacer build de producción.

### Configuración
En `vite.config.ts`:
```typescript
viteImagemin({
  mozjpeg: { quality: 75 },
  webp: { quality: 75 },
})
```

### Cómo usar
Las imágenes en `public/imagenes/` se optimizarán automáticamente al correr:
```bash
npm run build
```

### Resultado esperado
- Imágenes JPEG/PNG → WebP
- Reducción de 50-70% en tamaño
- Carga más rápida de páginas con imágenes de propiedades

---

## 2️⃣ BUNDLE SPLITTING

### ¿Qué hace?
Separa las dependencias grandes en chunks individuales para mejor caching.

### Chunks creados
- `vendor-react.js` - React, React DOM, React Router
- `vendor-stripe.js` - Stripe (solo se carga si usuario va a pagar)
- `vendor-supabase.js` - Cliente de Supabase
- `vendor-ui.js` - Framer Motion, Recharts, Toast
- `vendor-i18n.js` - Sistema de traducciones

### Beneficio
Si actualizas código de la app, el navegador usa el cache de React (que no cambió).

---

## 3️⃣ CACHÉ DE API CON useQueryCache

### ¿Qué hace?
Guarda resultados de queries en memoria para evitar llamadas repetitivas a Supabase.

### Cómo usar

#### Antes (sin caché):
```typescript
const [properties, setProperties] = useState([]);

useEffect(() => {
  propertyService.getProperties().then(setProperties);
}, []);
```

#### Después (con caché):
```typescript
import { useQueryCache } from '@hooks/useQueryCache';

const { data: properties, loading, error, refetch } = useQueryCache({
  key: 'properties-list',
  queryFn: () => propertyService.getProperties(),
  ttl: 5 * 60 * 1000, // 5 minutos
});
```

### Funciones helper

#### Invalidar cache después de crear/editar
```typescript
import { invalidateCache } from '@hooks/useQueryCache';

await createProperty(newProperty);
invalidateCache('properties-list'); // Forza refetch
```

#### Limpiar todo el cache (al logout)
```typescript
import { clearCache } from '@hooks/useQueryCache';

const handleLogout = () => {
  clearCache();
  // ... resto de logout
};
```

### Beneficios
- ✅ Menos llamadas a Supabase = más rápido
- ✅ Datos compartidos entre componentes
- ✅ Reducción de carga en la base de datos
- ✅ Mejor experiencia de usuario (respuesta instantánea)

---

## 4️⃣ PERFORMANCE MONITORING

### ¿Qué hace?
Mide métricas reales de performance usando Web Vitals de Google.

### Métricas monitoreadas

| Métrica | Qué mide | Valor bueno |
|---------|----------|-------------|
| **LCP** | Tiempo hasta contenido principal | < 2.5s |
| **FID** | Tiempo hasta primera interacción | < 100ms |
| **CLS** | Estabilidad visual durante carga | < 0.1 |
| **FCP** | Tiempo hasta primer pixel | < 1.8s |
| **TTFB** | Velocidad de respuesta del servidor | < 800ms |

### Dónde ver los resultados

#### En desarrollo (consola):
```
✅ [Performance] LCP: 1250.00ms (good)
⚠️ [Performance] FID: 150.00ms (needs-improvement)
```

#### En producción (Google Analytics):
Las métricas se envían automáticamente a GA4 si está configurado.

#### En localStorage (debugging):
```javascript
// En DevTools console
JSON.parse(localStorage.getItem('perf_metrics'))
```

### Helpers disponibles

```typescript
import { 
  getStoredMetrics,
  clearStoredMetrics,
  logNavigationPerformance 
} from '@/utils/performanceMonitoring';

// Ver métricas guardadas
console.log(getStoredMetrics());

// Limpiar métricas
clearStoredMetrics();

// Log de navegación
logNavigationPerformance('/dashboard');
```

---

## 5️⃣ OPTIMIZACIÓN DE FORMULARIOS

### ¿Qué hace?
Usa `useCallback` para evitar que los handlers se recreen en cada render.

### Antes (sin optimizar):
```typescript
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

// Se recrea en cada render → hijo re-renderiza
```

### Después (optimizado):
```typescript
const handleChange = useCallback((e) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
}, []);

// Se crea una vez → hijo NO re-renderiza si no es necesario
```

### Componentes optimizados
- ✅ `PropertyForm.tsx`
- ✅ `ReservationForm.tsx`

### Beneficio
- Menos re-renders = formularios más rápidos
- Mejor experiencia en móviles (menos lag al escribir)

---

## 6️⃣ COMPRESIÓN GZIP Y BROTLI

### ¿Qué hace?
Comprime archivos JS/CSS antes de enviarlos al navegador.

### Formatos generados
- `.gz` - GZIP (compatibilidad universal)
- `.br` - Brotli (mejor compresión, navegadores modernos)

### Beneficio
- 30% menos datos transferidos
- Carga más rápida en conexiones lentas

### Configuración del servidor
Si usas **Vercel/Netlify**: Ya está habilitado automáticamente.

Si usas servidor propio, asegúrate que:
```nginx
# nginx.conf
gzip on;
gzip_types text/css application/javascript;
```

---

## 7️⃣ CODE SPLITTING ADICIONAL

### ¿Qué hace?
Carga componentes grandes solo cuando se necesitan (lazy loading).

### Componentes con lazy load
- `AgentUsageAreaChart` - Solo se carga si usuario ve dashboard
- `MinimalIncidentMetrics` - Solo en dashboard
- `PropertyDetail` - Solo cuando se abre modal de propiedad

### Ejemplo en DashboardPage:
```typescript
// Lazy import
const AgentUsageAreaChart = lazy(() => import('./components/AgentUsageBarChart'));

// Uso con Suspense
<Suspense fallback={<div>Cargando gráfico...</div>}>
  <AgentUsageAreaChart />
</Suspense>
```

### Beneficio
- Bundle inicial más pequeño
- Carga más rápida de la primera pantalla
- Usuario solo descarga lo que usa

---

## 🧪 CÓMO TESTEAR LAS MEJORAS

### 1. Test de velocidad de build
```bash
# Medir tiempo de build
time npm run build
```

### 2. Test de tamaño de bundle
```bash
npm run build
# Ver tamaño en dist/assets/
ls -lh dist/assets/*.js
```

### 3. Test de performance en navegador

1. Abre Chrome DevTools
2. Ve a la pestaña **Lighthouse**
3. Corre audit de "Performance"
4. Revisa scores:
   - Performance: > 90
   - FCP: < 1.8s
   - LCP: < 2.5s

### 4. Test de caché de API

```javascript
// En consola del navegador
import { getCacheStats } from '@hooks/useQueryCache';

console.log(getCacheStats());
// Output: { size: 3, keys: ['properties-list', 'reservations-list', ...] }
```

---

## 📈 RESULTADOS ESPERADOS

### Antes de optimizaciones:
- Bundle inicial: ~800KB
- Tiempo de carga: 3-4s
- Performance score: 60-70
- Imágenes: 2-3MB por página de propiedades

### Después de optimizaciones:
- Bundle inicial: ~400KB (50% reducción)
- Tiempo de carga: 1.5-2s (50% más rápido)
- Performance score: 85-95
- Imágenes: 500KB-900KB (70% reducción)

---

## 🔧 MANTENIMIENTO

### Limpiar cache manualmente
Si notas que los datos no se actualizan:
```typescript
import { clearCache } from '@hooks/useQueryCache';
clearCache();
```

### Ver métricas de performance
```typescript
import { getStoredMetrics } from '@/utils/performanceMonitoring';
console.table(getStoredMetrics());
```

### Agregar nuevo query cacheado
```typescript
const { data, loading, refetch } = useQueryCache({
  key: 'mi-nuevo-query', // Clave única
  queryFn: () => miServicio.getData(),
  ttl: 10 * 60 * 1000, // 10 minutos
});
```

---

## 🚨 TROUBLESHOOTING

### Problema: "Las imágenes no se optimizan"
**Solución**: Solo se optimizan en build de producción:
```bash
npm run build  # NO npm run dev
```

### Problema: "El cache no se invalida"
**Solución**: Llama a `invalidateCache('clave')` después de mutar datos:
```typescript
await updateProperty(id, data);
invalidateCache('properties-list');
```

### Problema: "Bundle todavía es grande"
**Solución**: Analiza el bundle:
```bash
npm install -D rollup-plugin-visualizer
# Agrega plugin a vite.config.ts
# Verifica qué dependencias son más pesadas
```

---

## 📚 REFERENCIAS

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React.lazy & Suspense](https://react.dev/reference/react/lazy)
- [Bundle Analysis Guide](https://vitejs.dev/guide/build.html#build-optimizations)

---

## ✅ CHECKLIST DE OPTIMIZACIÓN

Cuando agregues nuevos features, revisa:

- [ ] ¿Las imágenes nuevas están en formato optimizado?
- [ ] ¿Los componentes grandes usan lazy loading?
- [ ] ¿Los queries repetitivos usan `useQueryCache`?
- [ ] ¿Los handlers de formulario usan `useCallback`?
- [ ] ¿Las listas grandes usan `useMemo`?
- [ ] ¿Se invalida el cache al mutar datos?
- [ ] ¿El bundle de producción es < 500KB?
- [ ] ¿El Performance score es > 85?

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Equipo de desarrollo



