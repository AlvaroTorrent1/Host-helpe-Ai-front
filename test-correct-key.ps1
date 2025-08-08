# Test con la anon key correcta encontrada
$url = "https://blxngmtmknkdmikaflen.supabase.co/rest/v1/documents"
$correctKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu"

Write-Host "🔍 Probando con la anon key correcta..." -ForegroundColor Green

$headers = @{
    "apikey" = $correctKey
    "Authorization" = "Bearer $correctKey"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "✅ ¡ÉXITO! Encontrados $($response.Count) documentos" -ForegroundColor Green
    
    Write-Host "`n🔍 Buscando información de WiFi..." -ForegroundColor Yellow
    $wifiFound = $false
    
    foreach ($doc in $response) {
        if ($doc.content) {
            $content = $doc.content.ToLower()
            if ($content.Contains("wifi") -or $content.Contains("wi-fi") -or $content.Contains("password") -or $content.Contains("contraseña")) {
                Write-Host "`n🎯 ¡DOCUMENTO CON INFO DE WIFI ENCONTRADO!" -ForegroundColor Red
                Write-Host "📄 ID: $($doc.id)" -ForegroundColor White
                Write-Host "📄 Primeros 500 caracteres:" -ForegroundColor White
                Write-Host $doc.content.Substring(0, [Math]::Min(500, $doc.content.Length)) -ForegroundColor Cyan
                $wifiFound = $true
                break
            }
        }
    }
    
    if (-not $wifiFound) {
        Write-Host "⚠️ No se encontró información de WiFi en los documentos" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}