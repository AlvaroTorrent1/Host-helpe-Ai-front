# Test de Token Lynx

## Opciones a Probar

### Opción 1: SIN backslashes (más probable)
```
3AI7-9c2.cpW!NFR&m7]N2:"DZ=HI<P}F
```

### Opción 2: CON backslashes literales
```
3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F
```

## Comando para Configurar

### Usando CLI de Supabase (recomendado):

**Para Opción 1 (sin backslashes):**
```bash
supabase secrets set LYNX_PARTNERS_API_TOKEN="3AI7-9c2.cpW!NFR&m7]N2:\"DZ=HI<P}F"
```

**Para Opción 2 (con backslashes):**
```bash
supabase secrets set LYNX_PARTNERS_API_TOKEN='3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F'
```

### Usando PowerShell:

**Para Opción 1:**
```powershell
supabase secrets set "LYNX_PARTNERS_API_TOKEN=3AI7-9c2.cpW!NFR&m7]N2:`"DZ=HI<P}F"
```

## ¿Cómo Verificar?

Después de configurar, ve a los logs de la función y busca:
```
🔍 Token DEBUG: {"raw":"..."}
```

El campo `raw` debe mostrar exactamente 35-45 caracteres sin dobles backslashes.




