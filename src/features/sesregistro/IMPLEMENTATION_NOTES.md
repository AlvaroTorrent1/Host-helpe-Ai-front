# Implementation Notes - Traveler Forms System

## ✅ Completed (2025-10-29)

### 1. Database Schema
- ✅ Created `traveler_form_requests` table
- ✅ Created `traveler_form_data` table
- ✅ Added 7 performance indexes
- ✅ Added triggers for auto-status updates
- ✅ Added RLS policies for security
- ✅ Added GDPR auto-delete function (3 years)

### 2. Dashboard Integration
- ✅ Created `travelerFormsService.ts`
- ✅ Connected `TravelerReportsManager` with Supabase
- ✅ Real-time data loading with filters
- ✅ View details modal with traveler data
- ✅ Loading states and error handling

### 3. Services
- ✅ List requests with filters (property, dates, status)
- ✅ Get request by ID
- ✅ Get traveler data
- ✅ Create new request
- ✅ Delete request

---

## ⏳ Pending Implementation

### 1. Public Form Submission (CRITICAL)
The `submitTravelerData` method in `travelerFormsService.ts` is currently a placeholder.

**Why it needs special implementation:**
- Tourists are NOT authenticated users
- RLS policies block unauthenticated writes
- Direct client calls won't work

**Implementation options:**

#### Option A: Supabase Edge Function (RECOMMENDED)
```typescript
// supabase/functions/submit-traveler-form/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Parse request
  const { token, travelerData } = await req.json()
  
  // Create Supabase client with service_role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Has RLS bypass
  )
  
  // Validate token
  const { data: request } = await supabase
    .from('traveler_form_requests')
    .select('*')
    .eq('token', token)
    .single()
  
  if (!request) {
    return new Response('Invalid token', { status: 404 })
  }
  
  if (request.status === 'completed') {
    return new Response('Form already completed', { status: 400 })
  }
  
  if (new Date(request.expires_at) < new Date()) {
    return new Response('Form expired', { status: 410 })
  }
  
  // Compress signature if needed
  // TODO: Add signature compression logic
  
  // Insert traveler data
  const { error } = await supabase
    .from('traveler_form_data')
    .insert({
      form_request_id: request.id,
      ...travelerData,
    })
  
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
  
  // Status will auto-update via trigger
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Deploy command:**
```bash
supabase functions deploy submit-traveler-form
```

**Update service:**
```typescript
// In travelerFormsService.ts
async submitTravelerData(token, travelerData) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/submit-traveler-form`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ token, travelerData })
    }
  );
  
  return await response.json();
}
```

#### Option B: Backend API Endpoint
If using a separate backend (Express, Fastify, etc.):
- Similar logic to Edge Function
- Use Supabase client with service_role key
- Add rate limiting
- Add CORS headers

### 2. Form Route Update
Currently: `/check-in/:propertyName` (insecure)
Needed: `/check-in/:token` (secure)

**Steps:**
1. Keep old route for backward compatibility (temporary)
2. Add new route `/check-in/:token`
3. Update `SesRegistroPage` to handle both
4. Load data from `traveler_form_requests` by token
5. Remove old route after migration

### 3. PDF Generation
Currently: Placeholder with toast message
Needed: Real PDF generation

**Options:**
- `@react-pdf/renderer` (client-side)
- Edge Function with PDF library (server-side)
- LynxCheckin provides PDFs (simplest if available)

### 4. N8N Integration
**Endpoints needed for n8n:**
```
POST /api/traveler-forms/create
Body: {
  property_id, reservation_id, 
  check_in_date, check_out_date,
  guest_email, guest_phone,
  num_travelers_expected
}
Response: {
  request_id, token,
  url: "https://app.com/check-in/{token}"
}

Webhook (optional):
POST /api/webhooks/traveler-form-completed
Body: { request_id, status }
```

### 5. Email Templates (Resend)
- Initial invitation email with token link
- Confirmation email after completion
- Reminder email if not completed
- Gestor notification email

---

## 🔒 Security Considerations

1. **Token Generation**: Using `crypto.randomUUID()` ✅
2. **Token Expiration**: Configurable (default 30 days) ✅
3. **One-time Use**: Status prevents resubmission ✅
4. **RLS Policies**: Implemented ✅
5. **Service Role**: Only in Edge Functions/Backend ⏳
6. **Rate Limiting**: TODO
7. **Input Validation**: TODO (add zod schemas)

---

## 📊 Testing Checklist

- [ ] Create form request manually via service
- [ ] Test dashboard loading with real data
- [ ] Test filters (property, dates, status)
- [ ] Test view details modal
- [ ] Test with completed vs pending forms
- [ ] Test Edge Function (when implemented)
- [ ] Test form submission from public URL
- [ ] Test GDPR auto-delete function
- [ ] Test RLS policies (try accessing other user's data)
- [ ] Load test with 1000+ records

---

## 🚀 Deployment Steps

1. ✅ Run migrations in Supabase
2. ✅ Deploy frontend with new dashboard
3. ⏳ Create and deploy Edge Function
4. ⏳ Update form route
5. ⏳ Configure n8n workflows
6. ⏳ Set up email templates
7. ⏳ Enable GDPR auto-delete cron job

---

## 📝 Environment Variables Needed

```env
# Already configured (assumed)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# For Edge Function (server-side only)
SUPABASE_SERVICE_ROLE_KEY=

# For LynxCheckin integration (future)
VITE_LYNX_API_KEY=
VITE_LYNX_API_URL=
```

---

## 📚 Related Files

- `src/services/travelerFormsService.ts` - Main service
- `src/features/sesregistro/components/TravelerReportsManager.tsx` - Dashboard
- `src/features/sesregistro/SesRegistroPage.tsx` - Public form (needs update)
- Migrations: Applied via Supabase MCP

---

## ⚠️ Important Notes

1. **DO NOT** expose service_role key in frontend code
2. **ALWAYS** validate tokens before allowing data insertion
3. **COMPRESS** signature images before storing (target: 15-30KB)
4. **LOG** all form submissions for audit trail
5. **GDPR**: Auto-delete after 3 years (Real Decreto 933/2021)
6. **BACKUP**: Supabase handles automatic backups
7. **MONITORING**: Set up alerts for failed submissions

---

Last updated: 2025-10-29

