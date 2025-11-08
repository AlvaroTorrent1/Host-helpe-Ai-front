# 🚀 Próximos Pasos - Integración Lynx Check-in

## 📋 Resumen de lo que hemos hecho

He creado una **integración completa** con Lynx Check-in para que tus partes de viajero se envíen automáticamente al Ministerio del Interior.

### ✅ Archivos creados:

1. **Documentación completa:**
   - `documentation/integrations/lynx-checkin-integration.md` - Guía técnica detallada
   - `documentation/integrations/lynx-checkin-deployment-guide.md` - Guía de despliegue
   - `documentation/integrations/LYNX_RESUMEN_EJECUTIVO.md` - Resumen ejecutivo en español

2. **Servicios de API:**
   - `src/services/lynxCheckinService.ts` - Servicio frontend
   - `supabase/functions/_shared/lynxCheckinService.ts` - Servicio para Edge Functions

3. **Edge Functions:**
   - `supabase/functions/lynx-list-lodgings/index.ts` - Lista lodgings de Lynx
   - `supabase/functions/submit-traveler-form/index.ts` - Modificada para enviar a Lynx

4. **Componente UI:**
   - `src/features/properties/components/LynxSyncTool.tsx` - Herramienta de sincronización

5. **Migración de BD:**
   - `supabase/migrations/20251030_add_lynx_lodging_id_to_properties.sql`

---

## 🎯 Lo que necesitas hacer ahora

### 1️⃣ Contactar a Lynx Check-in (URGENTE)

**Email:** soporte@lynxcheckin.com

**Mensaje sugerido:**
```
Asunto: Solicitud de API Key para integración Partners API

Hola,

Somos Host Helper y queremos integrar nuestra plataforma con Lynx Check-in 
para el envío automático de partes de viajero.

Tenemos:
- Account ID: a190fff8-c5d0-49a2-80a8-79b38ce0f284
- Ya tenemos el endpoint de partners-api funcionando

Necesitamos:
- API Key de producción para autenticar nuestras peticiones
- Documentación completa de la Partners API
- Confirmación de rate limits

Gracias.
```

### 2️⃣ Cuando recibas la API Key de Lynx

```bash
# Configurar en Supabase
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase secrets set LYNX_API_KEY="la-api-key-que-te-den"
```

### 3️⃣ Ejecutar migración de base de datos

**Opción A - Via CLI:**
```bash
supabase db push
```

**Opción B - Via Dashboard:**
1. Ve a Supabase Dashboard > SQL Editor
2. Abre el archivo: `supabase/migrations/20251030_add_lynx_lodging_id_to_properties.sql`
3. Copia y pega el contenido
4. Click "Run"

### 4️⃣ Desplegar Edge Functions

```bash
supabase functions deploy lynx-list-lodgings
supabase functions deploy submit-traveler-form --no-verify-jwt
```

### 5️⃣ Integrar herramienta de sincronización

Añade la ruta en tu router principal:

```typescript
// En src/App.tsx o tu archivo de rutas
import { LynxSyncTool } from '@/features/properties/components/LynxSyncTool';

// Añadir ruta protegida:
<Route path="/properties/lynx-sync" element={<LynxSyncTool />} />
```

Y añade un link en tu menú de propiedades:
```typescript
<Link to="/properties/lynx-sync">
  🔗 Sincronizar con Lynx Check-in
</Link>
```

### 6️⃣ Vincular tus propiedades

1. Login como gestor
2. Ve a `/properties/lynx-sync`
3. Selecciona el lodging de Lynx para cada propiedad

### 7️⃣ Probar el flujo completo

1. Crear una solicitud de parte de viajero
2. Turista completa el formulario
3. Verificar logs de Edge Function
4. Verificar que `lynx_submission_id` se guardó

---

## 📖 Documentación

**Lee primero:** `documentation/integrations/LYNX_RESUMEN_EJECUTIVO.md`

**Para deployment:** `documentation/integrations/lynx-checkin-deployment-guide.md`

**Para detalles técnicos:** `documentation/integrations/lynx-checkin-integration.md`

---

## 🔍 ¿Cómo funciona?

### Flujo automático:
```
Turista completa formulario
  ↓
Se guarda en tu BD (Host Helper)
  ↓
Sistema detecta que todos los viajeros están completos
  ↓
Busca lynx_lodging_id de la propiedad
  ↓
Envía a Lynx API automáticamente
  ↓
Lynx transmite al Ministerio del Interior
  ↓
Sistema guarda lynx_submission_id
  ↓
Gestor ve "✅ Enviado a Lynx"
```

### Sin configuración:
Si una propiedad NO tiene `lynx_lodging_id`:
- Los datos se guardan normalmente en tu BD
- NO se envían a Lynx (warning en logs)
- El gestor debe vincular la propiedad

---

## ⚠️ Importante

1. **API Key es secreta** - Solo guardarla en Supabase Secrets, nunca en frontend
2. **Vincular propiedades** - Sin esto, los partes no se envían a Lynx
3. **Testing** - Prueba con datos reales antes de producción
4. **Monitoreo** - Revisa logs de Edge Functions para ver si hay errores

---

## 🆘 Si tienes problemas

### Error: "LYNX_API_KEY no está configurado"
→ Ejecuta: `supabase secrets set LYNX_API_KEY="tu-key"`

### Error: "Property no tiene lynx_lodging_id"
→ Ve a `/properties/lynx-sync` y vincula la propiedad

### Error: "No se pudieron obtener lodgings"
→ Verifica API Key con curl manualmente:
```bash
curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings \
  -H "Authorization: Bearer TU_API_KEY"
```

---

## ✅ Checklist

- [ ] Contacté a Lynx y solicité API Key
- [ ] Recibí API Key
- [ ] Configuré `LYNX_API_KEY` en Supabase
- [ ] Ejecuté migración de BD
- [ ] Desplegué Edge Functions
- [ ] Integré `LynxSyncTool` en el frontend
- [ ] Vinculé mis propiedades con lodgings
- [ ] Probé el flujo completo
- [ ] Verificué logs de Edge Functions

---

**🎉 Una vez completado, tendrás cumplimiento legal automático del Real Decreto 933/2021**

**Contacto:** Si tienes dudas, consulta la documentación en `documentation/integrations/`


















