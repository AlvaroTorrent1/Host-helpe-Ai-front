// pages/api/elevenlabs/tts.ts
// API Route para proxy del TTS de ElevenLabs (Next.js)

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obtener el token de autorización
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' })
    }

    // Proxy la solicitud a la Edge Function de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return res.status(500).json({ error: 'Supabase URL not configured' })
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/elevenlabs-tts`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    })

    // Copiar headers importantes
    const audioSource = response.headers.get('X-Audio-Source')
    const processingTime = response.headers.get('X-Processing-Time')
    const requestHash = response.headers.get('X-Request-Hash')

    if (audioSource) res.setHeader('X-Audio-Source', audioSource)
    if (processingTime) res.setHeader('X-Processing-Time', processingTime)
    if (requestHash) res.setHeader('X-Request-Hash', requestHash)

    // Copiar status code
    res.status(response.status)

    // Determinar tipo de respuesta
    const contentType = response.headers.get('Content-Type')
    if (contentType?.includes('application/json')) {
      // Respuesta JSON (batch processing, error, etc.)
      const data = await response.json()
      res.setHeader('Content-Type', 'application/json')
      return res.json(data)
    } else {
      // Respuesta de audio
      const audioBuffer = await response.arrayBuffer()
      res.setHeader('Content-Type', 'audio/mpeg')
      return res.send(Buffer.from(audioBuffer))
    }

  } catch (error) {
    console.error('TTS API proxy error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Configuración para manejar archivos grandes
export const config = {
  api: {
    responseLimit: '10mb', // Permitir respuestas de hasta 10MB para audio
  },
}
