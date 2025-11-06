# Lynx Check-in Partners API - Specification Request

**From:** Host Helper  
**To:** Lynx Check-in Development Team  
**Date:** October 30, 2025  
**Subject:** API Requirements for Automated Integration

---

## Executive Summary

We need to automatically create lodgings in Lynx from Host Helper when users create properties, without manual intervention. This document specifies the required endpoints and data structure.

---

## Required Endpoints

### 1. Create Lodging (CRITICAL)

```http
POST /accounts/{accountId}/lodgings
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Villa Marbella",
  "address": "Calle Mayor 123",
  "city": "Marbella",
  "postal_code": "29600",
  "province": "Málaga",
  "country": "ES",
  "tourism_license": "VFT/MA/12345",
  "license_type": "VFT",
  "property_type": "villa",
  "max_guests": 8,
  "num_bedrooms": 4,
  "num_bathrooms": 3,
  "owner": {
    "name": "Juan García López",
    "email": "juan@example.com",
    "phone": "+34600123456",
    "id_type": "DNI",
    "id_number": "12345678A"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "lodging_id": "3dfc0644-612d-4449-9dd6-de7a9d15b012",
  "status": "active",
  "created_at": "2025-10-30T10:00:00Z"
}
```

**Validation Pending Response (202 Accepted):**
```json
{
  "success": true,
  "lodging_id": "3dfc0644-612d-4449-9dd6-de7a9d15b012",
  "status": "pending_validation",
  "message": "Lodging created. Manual validation required.",
  "created_at": "2025-10-30T10:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "validation_errors": [
    {
      "field": "tourism_license",
      "message": "License VFT/MA/12345 not found in official database"
    }
  ]
}
```

---

### 2. Validate License (CRITICAL)

```http
POST /accounts/{accountId}/validate-license
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tourism_license": "VFT/MA/12345",
  "province": "Málaga"
}
```

**Success Response (200 OK):**
```json
{
  "valid": true,
  "license_type": "VFT",
  "province": "Málaga",
  "status": "active"
}
```

**Invalid Response (200 OK):**
```json
{
  "valid": false,
  "errors": [
    "License not found in official database",
    "Province mismatch: expected Madrid, got Málaga"
  ]
}
```

**Why we need this:** To provide real-time feedback to users while filling the form, before they submit.

---

### 3. Update Lodging (IMPORTANT)

```http
PUT /accounts/{accountId}/lodgings/{lodgingId}
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Request Body:** Same as POST /lodgings

**Response:** Same as POST /lodgings

**Use case:** User edits property data (capacity, address, etc.)

---

### 4. Delete Lodging (IMPORTANT)

```http
DELETE /accounts/{accountId}/lodgings/{lodgingId}
Authorization: Bearer {apiKey}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Lodging deleted successfully"
}
```

**Questions:**
- Is this a soft delete or hard delete?
- What happens to traveler reports already submitted for this lodging?

---

### 5. List Lodgings (ALREADY EXISTS ✅)

```http
GET /accounts/{accountId}/lodgings
Authorization: Bearer {apiKey}
```

Already working with:
```bash
curl https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1/accounts/a190fff8-c5d0-49a2-80a8-79b38ce0f284/lodgings
```

---

## Data Model

### Property Types
- `apartment` - Apartamento
- `house` - Casa
- `villa` - Villa/Chalet
- `room` - Habitación

### License Types
- `VFT` - Vivienda con Fines Turísticos
- `VUT` - Vivienda de Uso Turístico
- `VTAR` - Apartamento Turístico
- `Other` - Otros

### Owner ID Types
- `DNI` - Documento Nacional de Identidad
- `NIE` - Número de Identidad de Extranjero
- `PASSPORT` - Pasaporte

### Lodging Status
- `active` - Ready to submit traveler reports
- `pending_validation` - Waiting for manual approval
- `rejected` - Validation failed
- `inactive` - Temporarily disabled

---

## Webhooks (Optional but Recommended)

### Lodging Approved
```json
POST https://hosthelper.com/webhooks/lynx
{
  "event": "lodging.approved",
  "lodging_id": "uuid",
  "account_id": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
  "timestamp": "2025-10-30T10:00:00Z"
}
```

### Lodging Rejected
```json
POST https://hosthelper.com/webhooks/lynx
{
  "event": "lodging.rejected",
  "lodging_id": "uuid",
  "account_id": "a190fff8-c5d0-49a2-80a8-79b38ce0f284",
  "errors": ["Invalid tourism license"],
  "timestamp": "2025-10-30T10:00:00Z"
}
```

**Benefit:** Avoid polling. We get instant notifications when status changes.

---

## Technical Requirements

### Performance
- **Response time:** < 2 seconds for basic validation
- **Async validation:** If complex validation needed, return `202 Accepted` immediately, notify via webhook when done

### Rate Limits
- **Minimum needed:** 60 requests/minute
- **Ideal:** Unlimited (enterprise account)

### Authentication
- **Method:** Bearer token in Authorization header
- **Scope:** One API key per account

### Error Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 202 | Accepted (pending validation) |
| 400 | Bad request / Validation error |
| 401 | Unauthorized |
| 404 | Lodging not found |
| 409 | Conflict (duplicate license?) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Testing Environment

**Question:** Is there a sandbox/testing environment?

**What we need:**
- Test API key
- Doesn't create real lodgings
- Doesn't submit to Ministry
- Can test all endpoints safely

---

## Integration Flow

```
User creates property in Host Helper
  ↓
Frontend validates license (POST /validate-license)
  ↓ (if valid)
User saves property
  ↓
Host Helper Edge Function calls POST /lodgings
  ↓
Lynx API responds:
  - 200 OK + lodging_id → Property ready ✅
  - 202 Accepted → Pending validation ⏳
  - 400 Error → Show error to user ❌
  ↓
Host Helper saves lynx_lodging_id
  ↓
Property ready to submit traveler reports
```

---

## Volume Estimates

**Expected traffic:**
- 100-500 new properties per month
- Peak: 10-20 simultaneous creations
- Average: 1-2 creations per hour

**Batch operations:**
- Some users may import 50+ properties at once from channel managers
- Would batch creation endpoint be useful?

---

## Questions

1. **Timeline:** When will these endpoints be available?
2. **Validation:** Synchronous or asynchronous? How long does validation take?
3. **Duplicate licenses:** What happens if two users try to register same license?
4. **Testing:** How can we test without affecting production data?
5. **Documentation:** Is there API documentation (Swagger/OpenAPI)?
6. **Webhooks:** Are they available? How do we register webhook URL?

---

## Contact

**Technical Lead:** [Your Name]  
**Email:** [Your Email]  
**Phone:** [Your Phone]  
**Company:** Host Helper  
**Website:** [Your Website]

---

## Next Steps

After this meeting:
1. Confirm available endpoints
2. Share API documentation
3. Provide testing API key
4. Set up webhook endpoint (if available)
5. Schedule follow-up for testing feedback

---

**Thank you for your collaboration!**

This integration will enable automated compliance with Real Decreto 933/2021 for our users.














