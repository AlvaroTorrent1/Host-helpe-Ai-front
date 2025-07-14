// File: /supabase/functions/ai-description-generator/index.ts
// Purpose: Generate AI descriptions for media files using OpenAI API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import OpenAI from 'https://esm.sh/openai@4.20.1'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

interface MediaFile {
  id: string
  property_id: string
  title: string
  description: string | null
  file_type: string
  category: string
  file_url: string
  public_url: string | null
  ai_prompt: string | null
  created_at: string
}

interface AIDescriptionRequest {
  file_id?: string
  batch_process?: boolean
  max_files?: number
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
    console.log('🤖 AI Description Generator started')
    
    const { file_id, batch_process = false, max_files = 5 }: AIDescriptionRequest = 
      await req.json()

    let filesToProcess: MediaFile[] = []

    if (file_id) {
      // Process single file
      console.log(`📄 Processing single file: ${file_id}`)
      
      const { data: file, error } = await supabase
        .from('media_files_pending_ai_description')
        .select('*')
        .eq('id', file_id)
        .single()

      if (error || !file) {
        throw new Error(`File not found: ${file_id}`)
      }

      filesToProcess = [file]
    } else if (batch_process) {
      // Process multiple files
      console.log(`📦 Processing batch of up to ${max_files} files`)
      
      const { data: files, error } = await supabase
        .from('media_files_pending_ai_description')
        .select('*')
        .limit(max_files)

      if (error) {
        throw new Error(`Error fetching files: ${error.message}`)
      }

      filesToProcess = files || []
    } else {
      throw new Error('Either file_id or batch_process must be specified')
    }

    if (filesToProcess.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No files pending AI description generation',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`🔄 Processing ${filesToProcess.length} files`)

    const results = []

    for (const file of filesToProcess) {
      try {
        console.log(`📝 Generating description for: ${file.title} (${file.id})`)

        // Mark as generating
        await supabase
          .from('media_files')
          .update({ 
            ai_description_status: 'generating',
            updated_at: new Date().toISOString()
          })
          .eq('id', file.id)

        // Get property context
        const { data: property } = await supabase
          .from('properties')
          .select('name, description, address')
          .eq('id', file.property_id)
          .single()

        // Build comprehensive prompt
        const systemPrompt = `You are an expert property description writer. Generate detailed, professional descriptions for property media files that would be valuable for property managers, guests, and maintenance staff.

Focus on:
- Practical details and context
- Visual elements and key features
- Usability for property management
- Guest experience enhancement
- Maintenance and cleaning guidance

Keep descriptions professional, concise (100-150 words), and factual.`

        const userPrompt = `Generate a detailed description for this ${file.file_type} file:

Property: ${property?.name || 'Unknown Property'}
Property Address: ${property?.address || 'Not specified'}
Property Description: ${property?.description || 'No description available'}

File Details:
- Category: ${file.category}
- Type: ${file.file_type}
- Title: ${file.title}
- Current Description: ${file.description || 'No description provided'}
- File URL: ${file.public_url || file.file_url}

${file.file_type === 'image' ? 
  'Analyze this image and describe what you see. Focus on rooms, features, condition, and practical details.' :
  'Describe this document and its relevance to property management and guest experience.'}

Provide a description that helps with property management, guest guidance, and maintenance planning.`

        // Generate AI description
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })

        const aiDescription = completion.choices[0]?.message?.content?.trim()

        if (!aiDescription) {
          throw new Error('No description generated by AI')
        }

        // Update with AI description
        const { error: updateError } = await supabase
          .rpc('update_ai_description', {
            p_file_id: file.id,
            p_ai_description: aiDescription,
            p_status: 'completed'
          })

        if (updateError) {
          throw new Error(`Error updating description: ${updateError.message}`)
        }

        console.log(`✅ Description generated for: ${file.title}`)
        
        results.push({
          file_id: file.id,
          title: file.title,
          status: 'completed',
          description_length: aiDescription.length,
          ai_description: aiDescription.substring(0, 100) + '...'
        })

      } catch (fileError) {
        console.error(`❌ Error processing file ${file.id}:`, fileError)

        // Mark as failed
        await supabase
          .rpc('mark_ai_description_failed', {
            p_file_id: file.id,
            p_error_message: fileError instanceof Error ? fileError.message : 'Unknown error'
          })

        results.push({
          file_id: file.id,
          title: file.title,
          status: 'failed',
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'completed').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(`🎯 AI Description generation completed: ${successCount} success, ${failedCount} failed`)

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${filesToProcess.length} files`,
      processed: filesToProcess.length,
      successful: successCount,
      failed: failedCount,
      results: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ AI Description Generator error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Export for Deno Deploy
export default serve 