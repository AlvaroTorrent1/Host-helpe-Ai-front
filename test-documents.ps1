# Script PowerShell para verificar documentos en Supabase
$supabaseUrl = "https://blxngmtmknkdmikaflen.supabase.co"
$serviceKey = "sbp_14888d63f86c3e52498f822bc1877646e31f94cb"

Write-Host "🔍 Verificando contenido de documentos FAQs..." -ForegroundColor Green
Write-Host "📍 Supabase URL: $supabaseUrl" -ForegroundColor Cyan

# Primero intentar sin autenticación para ver el error
Write-Host "`n1️⃣ Test sin autenticación..." -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/documents" -Method GET
    Write-Host "✅ Respuesta sin auth: $response1" -ForegroundColor Green
} catch {
    Write-Host "❌ Error esperado sin auth: $($_.Exception.Message)" -ForegroundColor Red
}

# Intentar con service key como apikey
Write-Host "`n2️⃣ Test con service key como apikey..." -ForegroundColor Yellow
try {
    $headers = @{
        "apikey" = $serviceKey
        "Authorization" = "Bearer $serviceKey"
    }
    $response2 = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/documents" -Method GET -Headers $headers
    Write-Host "✅ ¡Conexión exitosa!" -ForegroundColor Green
    Write-Host "📄 Documentos encontrados: $($response2.Count)" -ForegroundColor Cyan
    
    if ($response2.Count -gt 0) {
        Write-Host "`n📋 Documentos:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $response2.Count); $i++) {
            $doc = $response2[$i]
            Write-Host "`n📄 Documento $($i+1):" -ForegroundColor White
            Write-Host "- ID: $($doc.id)" -ForegroundColor Gray
            
            if ($doc.content) {
                $preview = $doc.content.Substring(0, [Math]::Min(200, $doc.content.Length))
                Write-Host "- Contenido: $preview..." -ForegroundColor Gray
                
                # Buscar información de WiFi
                if ($doc.content.ToLower().Contains("wifi") -or $doc.content.ToLower().Contains("wi-fi")) {
                    Write-Host "🎯 ¡ESTE DOCUMENTO CONTIENE INFO DE WIFI!" -ForegroundColor Red
                }
                if ($doc.content.ToLower().Contains("password") -or $doc.content.ToLower().Contains("contraseña")) {
                    Write-Host "🔑 ¡CONTIENE INFO DE PASSWORD!" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "⚠️ No se encontraron documentos" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error con service key: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test completado!" -ForegroundColor Green