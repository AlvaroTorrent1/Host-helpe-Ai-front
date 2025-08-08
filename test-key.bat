@echo off
echo Testing correct anon key...
curl.exe -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseG5nbXRta25rZG1pa2FmbGVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDAzNjMsImV4cCI6MjA1Nzk3NjM2M30.iIyu_9vwjMO_SOCovMZEAf-c9cNanD0u_cu" "https://blxngmtmknkdmikaflen.supabase.co/rest/v1/documents"
pause