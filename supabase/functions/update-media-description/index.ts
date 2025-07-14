// File: /supabase/functions/update-media-description/index.ts
// Purpose: Edge Function to receive n8n webhook responses and update media descriptions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client with service role (full access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface UpdateDescriptionRequest {
  media_file_id: string
  ai_description: string
  source?: string
  processing_time_ms?: number
  additional_metadata?: Record<string, any>
}

interface BatchUpdateRequest {
  batch_id: string
  property_id: string
  processed_images: Array<{
    media_file_id: string
    ai_description?: string
    processing_status: 'completed' | 'failed'
    error_message?: string
    processing_time_ms?: number
  }>
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('📥 Update media description request received')
    
    const requestBody = await req.json()
    console.log('📋 Request data:', {
      type: requestBody.batch_id ? 'batch' : 'single',
      batch_id: requestBody.batch_id,
      media_file_id: requestBody.media_file_id,
      images_count: requestBody.processed_images?.length
    })

    let result

    if (requestBody.batch_id && requestBody.processed_images) {
      // Handle batch update from n8n
      result = await handleBatchUpdate(requestBody as BatchUpdateRequest)
    } else if (requestBody.media_file_id) {
      // Handle single file update
      result = await handleSingleUpdate(requestBody as UpdateDescriptionRequest)
    } else {
      throw new Error('Invalid request: missing required fields')
    }

    console.log('✅ Update completed successfully:', result)

    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Error updating media description:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Handle batch update from n8n webhook
 */
async function handleBatchUpdate(request: BatchUpdateRequest) {
  console.log(`🔄 Processing batch update for ${request.processed_images.length} images`)
  
  const results = []
  let successCount = 0
  let failureCount = 0

  for (const image of request.processed_images) {
    try {
      if (image.processing_status === 'completed' && image.ai_description) {
        // Update successful processing
        const { error } = await supabase
          .rpc('update_media_description_from_external', {
            p_media_file_id: image.media_file_id,
            p_ai_description: image.ai_description,
            p_source: 'n8n_image_webhook'
          })

        if (error) {
          throw new Error(`Database update failed: ${error.message}`)
        }

        console.log(`✅ Updated description for ${image.media_file_id}`)
        successCount++
        
        results.push({
          media_file_id: image.media_file_id,
          status: 'updated',
          description_length: image.ai_description.length
        })

      } else {
        // Mark as failed
        const { error } = await supabase
          .rpc('mark_external_processing_failed', {
            p_media_file_id: image.media_file_id,
            p_error_message: image.error_message || 'Processing failed without description',
            p_source: 'n8n_image_webhook'
          })

        if (error) {
          throw new Error(`Database update failed: ${error.message}`)
        }

        console.log(`❌ Marked as failed: ${image.media_file_id}`)
        failureCount++
        
        results.push({
          media_file_id: image.media_file_id,
          status: 'failed',
          error: image.error_message
        })
      }

    } catch (error) {
      console.error(`❌ Error processing ${image.media_file_id}:`, error)
      failureCount++
      
      results.push({
        media_file_id: image.media_file_id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Check if all images for this property are now processed
  await checkAndUpdatePropertyStatus(request.property_id)

  return {
    batch_id: request.batch_id,
    property_id: request.property_id,
    total_processed: request.processed_images.length,
    successful_updates: successCount,
    failed_updates: failureCount,
    results: results
  }
}

/**
 * Handle single file update
 */
async function handleSingleUpdate(request: UpdateDescriptionRequest) {
  console.log(`🔄 Processing single update for ${request.media_file_id}`)

  const { error } = await supabase
    .rpc('update_media_description_from_external', {
      p_media_file_id: request.media_file_id,
      p_ai_description: request.ai_description,
      p_source: request.source || 'n8n_image_webhook'
    })

  if (error) {
    throw new Error(`Database update failed: ${error.message}`)
  }

  // If additional metadata provided, update it
  if (request.additional_metadata) {
    const { error: metadataError } = await supabase
      .from('media_files')
      .update({
        n8n_metadata: request.additional_metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.media_file_id)

    if (metadataError) {
      console.warn('⚠️ Failed to update metadata:', metadataError)
    }
  }

  // Get property_id to check status
  const { data: mediaFile } = await supabase
    .from('media_files')
    .select('property_id')
    .eq('id', request.media_file_id)
    .single()

  if (mediaFile) {
    await checkAndUpdatePropertyStatus(mediaFile.property_id)
  }

  console.log(`✅ Updated description for ${request.media_file_id}`)

  return {
    media_file_id: request.media_file_id,
    description_length: request.ai_description.length,
    processing_time_ms: request.processing_time_ms
  }
}

/**
 * Check if all images for a property are processed and update property status
 */
async function checkAndUpdatePropertyStatus(propertyId: string) {
  try {
    console.log(`🔍 Checking processing status for property ${propertyId}`)

    // Get all images for this property
    const { data: images, error } = await supabase
      .from('media_files')
      .select('n8n_processing_status, file_type')
      .eq('property_id', propertyId)
      .eq('file_type', 'image')

    if (error) {
      console.error('Error checking image status:', error)
      return
    }

    if (!images || images.length === 0) {
      console.log('No images found for property, activating...')
      // No images, activate property
      await activateProperty(propertyId)
      return
    }

    // Check if all images are processed
    const pendingImages = images.filter(img => 
      img.n8n_processing_status === 'pending' || 
      img.n8n_processing_status === 'processing'
    )

    if (pendingImages.length === 0) {
      console.log(`🎉 All images processed for property ${propertyId}, activating...`)
      await activateProperty(propertyId)
    } else {
      console.log(`⏳ ${pendingImages.length} images still pending for property ${propertyId}`)
    }

  } catch (error) {
    console.error('Error checking property status:', error)
  }
}

/**
 * Activate property when all processing is complete
 */
async function activateProperty(propertyId: string) {
  const { error } = await supabase
    .from('properties')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error activating property:', error)
  } else {
    console.log(`✅ Property ${propertyId} activated successfully`)
  }
}

// Export for Deno Deploy
export default serve 