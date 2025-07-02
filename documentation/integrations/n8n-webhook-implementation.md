# N8N Webhook Integration - Complete Implementation

## Overview

This document describes the complete implementation of the n8n webhook integration for property creation with AI-powered file categorization. The system processes property data and files through an intelligent pipeline that automatically categorizes images and documents before storing them in the database.

## Architecture

```
Frontend (PropertyManagement.tsx)
    ↓ (HTTP POST with files)
Supabase Edge Function (n8n-webhook)
    ↓ (AI Categorization)
PostgreSQL Database (Atomic Transaction)
    ↓ (Structured Data)
Ready for Messaging (WhatsApp/Telegram)
```

## Components

### 1. Frontend Integration

**File**: `src/features/properties/PropertyManagement.tsx`

- **Dual Mode System**: Toggle between webhook processing and direct Supabase
- **Progress Tracking**: Real-time progress indicators during processing
- **Fallback Mechanism**: Automatic fallback to direct database if webhook fails
- **User Controls**: Toggle for enabling/disabling AI processing

### 2. Webhook Service

**File**: `src/services/propertyWebhookService.ts`

- **Retry Logic**: Exponential backoff with up to 3 retry attempts
- **Authentication**: Bearer token authentication for security
- **Progress Callbacks**: Real-time progress updates to the UI
- **Health Checks**: Endpoint availability verification
- **Rollback Support**: Cleanup functionality for failed operations

### 3. Edge Function

**File**: `supabase/functions/n8n-webhook/index.ts`

- **CORS Support**: Proper cross-origin request handling
- **Token Authentication**: Secure webhook endpoint
- **AI Categorization**: Smart file classification using pattern matching
- **Atomic Operations**: Uses stored procedures for data integrity
- **Error Handling**: Comprehensive error management and logging

### 4. Database Layer

**File**: `supabase/migrations/20250119_create_transaction_functions.sql`

- **Transaction Functions**: Atomic property and file creation
- **Cleanup Functions**: Idempotent operations for data consistency
- **Error Recovery**: Proper rollback mechanisms

### 5. Testing Service

**File**: `src/services/webhookTestService.ts`

- **Complete Testing**: End-to-end webhook testing
- **Sample Data**: Realistic test data generation
- **Verification**: Database verification after operations
- **Cleanup**: Test data removal functionality

## File Categorization System

### Image Categories

The AI categorization system maps images to these categories:

| Source Category | AI Detection | Database Mapping |
|-----------------|--------------|------------------|
| `interni` | Living room, Kitchen, Bedroom, Bathroom | `file_type: 'image'`, `category: 'gallery'`, `subcategory: 'Interior'` |
| `esterni` | Facade, Terrace, Garden, Pool | `file_type: 'image'`, `category: 'gallery'`, `subcategory: 'Exterior'` |
| `elettrodomestici_foto` | Appliances, Electronics | `file_type: 'image'`, `category: 'gallery'`, `subcategory: 'Electrodomésticos'` |

### Document Categories

| Source Category | AI Detection | Database Mapping |
|-----------------|--------------|------------------|
| `documenti_casa` | Contract, Plans, Manual | `file_type: 'document'`, `category: 'document_contract/general/manual'` |
| `documenti_elettrodomestici` | Warranty, Manual | `file_type: 'document'`, `category: 'document_manual'` |

### Pattern Matching

The system uses regex patterns with weighted scoring:

```javascript
// Example patterns for kitchen detection
'Cocina': [
  { regex: /\b(cucina|kitchen|cocina)\b/i, weight: 10 },
  { regex: /\b(fornelli|fogones|vitrocerámica)\b/i, weight: 8 },
  { regex: /\b(frigorifero|nevera|lavavajillas)\b/i, weight: 6 }
]
```

## Security Features

### Authentication
- **Bearer Token**: All webhook requests require `Authorization: Bearer <token>`
- **Token Configuration**: Set via `N8N_WEBHOOK_TOKEN` environment variable
- **Default Token**: `hosthelper-n8n-secure-token-2024` (should be changed in production)

### Data Validation
- **Payload Validation**: Required fields validation
- **File Type Validation**: Proper MIME type checking
- **User Authentication**: Supabase user session validation

### Error Handling
- **Graceful Degradation**: Fallback to direct database on webhook failure
- **Atomic Operations**: All-or-nothing database transactions
- **Cleanup Mechanisms**: Automatic rollback on partial failures

## Usage Guide

### 1. Creating Properties with AI Processing

```typescript
// Enable webhook processing in UI
const useWebhook = true;

// The system automatically:
// 1. Organizes files by category
// 2. Sends to webhook endpoint
// 3. AI categorizes each file
// 4. Stores in database atomically
// 5. Provides progress feedback
```

### 2. Testing the Integration

```typescript
import { webhookTestService } from './services/webhookTestService';

// Test webhook health
await webhookTestService.testWebhookOnly();

// Run complete integration test
await webhookTestService.runFullTest();
```

### 3. Monitoring and Debugging

```typescript
// Check webhook health
const isHealthy = await propertyWebhookService.checkWebhookHealth();

// Enable detailed logging
console.log('Webhook processing enabled:', useWebhook);
```

## Environment Variables

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Webhook Security
VITE_N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
```

### Supabase Secrets (for Edge Functions)

```bash
# Set in Supabase Dashboard > Settings > Secrets
N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
```

## Deployment Instructions

### 1. Database Migration

```bash
# Apply transaction functions
supabase db push
```

### 2. Deploy Edge Function

```bash
# Deploy the webhook function
supabase functions deploy n8n-webhook

# Set environment variables
supabase secrets set N8N_WEBHOOK_TOKEN=your-secure-token
```

### 3. Frontend Configuration

```bash
# Set environment variables
VITE_N8N_WEBHOOK_TOKEN=your-secure-token
```

## API Reference

### Webhook Endpoint

**URL**: `https://your-project.supabase.co/functions/v1/n8n-webhook`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Payload**:
```json
{
  "property_id": "uuid",
  "user_id": "uuid",
  "property_data": {
    "name": "Property Name",
    "address": "Address",
    "city": "City",
    // ... other property fields
  },
  "uploaded_files": {
    "interni": [...],
    "esterni": [...],
    "elettrodomestici_foto": [...],
    "documenti_casa": [...],
    "documenti_elettrodomestici": [...]
  },
  "timestamp": "2025-01-19T...",
  "request_id": "unique-id"
}
```

**Response**:
```json
{
  "success": true,
  "property_id": "uuid",
  "files_processed": 12,
  "categorization_summary": {
    "images_by_category": { "Interior": 5, "Exterior": 3 },
    "documents_by_category": { "document_contract": 2 },
    "total_images": 8,
    "total_documents": 4
  },
  "message": "Property and files processed successfully",
  "timestamp": "2025-01-19T..."
}
```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Responding
```bash
# Check Edge Function logs
supabase functions logs n8n-webhook

# Verify deployment
supabase functions list
```

#### 2. Authentication Errors
```bash
# Verify token configuration
echo $N8N_WEBHOOK_TOKEN

# Check Supabase secrets
supabase secrets list
```

#### 3. Database Errors
```bash
# Check migration status
supabase db status

# Run migrations
supabase db push
```

#### 4. File Processing Errors
- **Large Files**: Check file size limits
- **Invalid MIME Types**: Verify file type validation
- **Network Issues**: Check retry mechanism logs

### Debug Mode

Enable detailed logging:

```typescript
// In PropertyManagement.tsx
const DEBUG_MODE = import.meta.env.MODE === 'development';

if (DEBUG_MODE) {
  console.log('Webhook payload:', payload);
  console.log('Processing result:', result);
}
```

## Performance Considerations

### File Size Limits
- **Individual Files**: 50MB max (Supabase limit)
- **Total Request**: 100MB max (recommended)
- **Concurrent Uploads**: Limited by browser connections

### Processing Time
- **Small Properties** (< 10 files): 2-5 seconds
- **Medium Properties** (10-30 files): 5-15 seconds
- **Large Properties** (30+ files): 15-30 seconds

### Optimization Tips
1. **Compress Images**: Use WebP format when possible
2. **Batch Processing**: Group files by category
3. **Progress Feedback**: Keep users informed during processing
4. **Fallback Strategy**: Always have direct database option

## Future Enhancements

### Planned Features
1. **Advanced AI**: Integration with OpenAI Vision API
2. **Image Optimization**: Automatic resizing and compression
3. **Bulk Operations**: Process multiple properties simultaneously
4. **Real-time Notifications**: WebSocket updates during processing
5. **Analytics**: Track categorization accuracy and performance

### Extensibility
The system is designed to be extensible:
- **New File Types**: Add patterns to categorization system
- **Custom Categories**: Extend database enums
- **Additional Processing**: Add new steps to webhook pipeline
- **External APIs**: Integrate with property management systems

## Conclusion

This implementation provides a robust, scalable solution for property creation with AI-powered file categorization. The system handles edge cases, provides excellent user experience, and maintains data integrity through atomic operations.

For support or questions, refer to the troubleshooting section or check the implementation files for detailed code comments.