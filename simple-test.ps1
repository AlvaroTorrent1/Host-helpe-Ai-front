# Script simple para verificar documentos
$url = "https://blxngmtmknkdmikaflen.supabase.co/rest/v1/documents"
$key = "sbp_14888d63f86c3e52498f822bc1877646e31f94cb"

Write-Host "Testing Supabase connection..." -ForegroundColor Green

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success! Found $($response.Count) documents" -ForegroundColor Green
    
    foreach ($doc in $response) {
        if ($doc.content -and $doc.content.ToLower().Contains("wifi")) {
            Write-Host "FOUND WIFI INFO in document $($doc.id)" -ForegroundColor Red
            Write-Host $doc.content.Substring(0, 500) -ForegroundColor Yellow
            break
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}