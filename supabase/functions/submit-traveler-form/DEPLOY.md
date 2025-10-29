# Deploy Instructions - submit-traveler-form

## 📦 Deploy via Supabase Dashboard

### Option 1: Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the sidebar
4. Click **"New Function"**
5. Name: `submit-traveler-form`
6. Copy/paste the code from `index.ts`
7. Click **"Deploy"**
8. **Important**: Disable JWT verification:
   - Click on the function
   - Go to Settings
   - Set "JWT Verification" to **OFF** (this is public, no auth needed)

### Option 2: Supabase CLI (Recommended for dev)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy submit-traveler-form --no-verify-jwt
```

## 🔐 Environment Variables

The function needs these environment variables (automatically available in Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (has RLS bypass)

**DO NOT** expose the service_role key in frontend code!

## 🧪 Test the Function

### Using curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-traveler-form \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "token": "test-token-here",
    "travelerData": {
      "first_name": "Test",
      "last_name": "User",
      "document_type": "DNI",
      "document_number": "12345678A",
      "nationality": "ES",
      "birth_date": "1990-01-01",
      "email": "test@example.com",
      "address_street": "Test Street 123",
      "address_city": "Madrid",
      "address_postal_code": "28001",
      "address_country": "ES",
      "signature_data": "data:image/png;base64,iVBORw0KGg...",
      "consent_accepted": true
    }
  }'
```

### Using JavaScript:

```javascript
const response = await fetch(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-traveler-form',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      token: 'your-token',
      travelerData: { /* ... */ }
    })
  }
);

const result = await response.json();
console.log(result);
```

## ✅ Success Response

```json
{
  "success": true,
  "message": "Parte de viajero enviado exitosamente",
  "data": {
    "request_id": "uuid-here",
    "traveler_id": "uuid-here"
  }
}
```

## ❌ Error Responses

### Invalid Token (404)
```json
{
  "error": "Token inválido o no encontrado"
}
```

### Expired Link (410)
```json
{
  "error": "El enlace ha expirado"
}
```

### Already Completed (400)
```json
{
  "error": "Este formulario ya ha sido completado"
}
```

## 📊 Monitoring

View function logs in Supabase Dashboard:
1. Go to Edge Functions
2. Click on `submit-traveler-form`
3. Go to **Logs** tab

## 🔒 Security Notes

- Function uses `service_role` key internally (has RLS bypass)
- Client only sends token + data
- Token is validated before any DB operation
- IP address is logged for audit trail
- CORS is enabled for browser access

## 🚀 After Deployment

Update the frontend service to use the deployed URL:

```typescript
// In src/services/travelerFormsService.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/submit-traveler-form`;
```

The function is already integrated in the service!

