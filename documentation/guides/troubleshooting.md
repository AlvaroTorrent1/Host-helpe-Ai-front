# Host Helper AI - Guía de Troubleshooting

**Última actualización:** Junio 2025

## 🚨 Problemas Comunes y Soluciones

### 1. Error: "npm error code ENOENT"

**Problema:** No se encuentra el package.json
```bash
npm error path C:\Users\Usuario\Desktop\nuevo-repo\package.json
```

**Solución:**
```bash
# Asegúrate de estar en el directorio correcto
cd Host-helpe-Ai-front
npm run dev
```

### 2. Error de Variables de Entorno

**Problema:** Aplicación no carga por variables faltantes

**Solución:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Error de Puerto Ocupado

**Problema:** Puerto 4000 en uso

**Solución:**
```bash
# Opción 1: Usar otro puerto
npm run dev -- --port 4001

# Opción 2: Matar proceso en puerto 4000
npx kill-port 4000
```

### 4. Problemas de n8n

**Problema:** Workflows no ejecutan

**Solución:**
- Verificar que n8n esté corriendo
- Revisar variables de entorno N8N_*
- Consultar [`../integrations/n8n-setup.md`](../integrations/n8n-setup.md)

## 🛠️ Debugging

### Logs del Sistema
```bash
# Ver logs de desarrollo
npm run dev

# Ver logs de construcción
npm run build

# Ver logs de tests
npm run test
```

### Limpieza de Cache
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de npm
npm cache clean --force
```

## 📞 Contacto de Soporte

- **Issues GitHub:** [GitHub Issues](https://github.com/AlvaroTorrent1/Host-helpe-Ai-front/issues)
- **Documentación:** [`../README.md`](../README.md)
- **Arquitectura:** [`../architecture/overview.md`](../architecture/overview.md) 