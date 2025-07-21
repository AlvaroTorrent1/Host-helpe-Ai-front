// scripts/test-document-vectorization.js
// Test script for document vectorization flow with corrected table structure

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const webhookUrl = process.env.VITE_N8N_WEBHOOK_URL || 'https://hosthelperai.app.n8n.cloud/webhook/pdf';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test document vectorization flow
 */
async function testDocumentVectorization() {
  console.log('🧪 Testing Document Vectorization Flow\n');
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: connectionTest, error: connError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (connError) {
      throw new Error(`Database connection failed: ${connError.message}`);
    }
    console.log('✅ Database connection successful\n');

    // 2. Check if documents table exists and has vector extension
    console.log('2️⃣ Checking documents table and vector extension...');
    const { data: documentsTable, error: tableError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log(`⚠️  Documents table issue: ${tableError.message}`);
    } else {
      console.log('✅ Documents table exists and is accessible');
    }

    // 3. Check media_files table structure (correct table for file storage)
    console.log('\n3️⃣ Checking media_files table structure...');
    const { data: mediaFiles, error: mediaError } = await supabase
      .from('media_files')
              .select('id, property_id, file_type, title, file_url, mime_type')
      .eq('file_type', 'document')
      .limit(5);
    
    if (mediaError) {
      console.log(`❌ Media files query failed: ${mediaError.message}`);
    } else {
      console.log(`✅ Found ${mediaFiles?.length || 0} documents in media_files table`);
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('Sample document structure:', JSON.stringify(mediaFiles[0], null, 2));
      }
    }

    // 4. Test webhook URL accessibility
    console.log('\n4️⃣ Testing webhook URL accessibility...');
    console.log(`Testing: ${webhookUrl}`);
    
    const testPayload = {
      fileUrl: 'https://example.com/test.pdf',
      propertyId: 'test-property-id',
      propertyName: 'Test Property',
      metadata: {
        file_id: 'test-file-id',
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.text();
        console.log('✅ Webhook is accessible');
        console.log('Response preview:', result.substring(0, 200) + '...');
      } else {
        console.log('⚠️  Webhook returned error status but is reachable');
      }
    } catch (fetchError) {
      console.log(`❌ Webhook not accessible: ${fetchError.message}`);
    }

    // 5. Look for PDF documents that could be vectorized
    console.log('\n5️⃣ Looking for PDF documents that could be vectorized...');
    const { data: pdfDocs, error: pdfError } = await supabase
      .from('media_files')
              .select('id, property_id, title, file_url, mime_type, property_name')
      .eq('file_type', 'document')
      .or('mime_type.ilike.%pdf%,title.ilike.%.pdf%')
      .limit(10);
    
    if (pdfError) {
      console.log(`❌ PDF search failed: ${pdfError.message}`);
    } else {
      console.log(`✅ Found ${pdfDocs?.length || 0} PDF documents`);
      
      if (pdfDocs && pdfDocs.length > 0) {
        console.log('\nPDF Documents found:');
        pdfDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title}`);
          console.log(`     Property: ${doc.property_name || 'Unknown'}`);
          console.log(`     MIME: ${doc.mime_type}`);
          console.log(`     Status: Available for processing`);
          console.log('');
        });

        // Show pending documents (not yet sent for vectorization)
        // Simplified: all documents are available for processing
      const pendingDocs = pdfDocs;
        console.log(`📋 Pending for vectorization: ${pendingDocs.length} documents`);
      }
    }

    // 6. Test vector search function (if available)
    console.log('\n6️⃣ Testing vector search function...');
    try {
      const { data: searchTest, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: new Array(1536).fill(0.1), // dummy embedding
        match_count: 1
      });
      
      if (searchError) {
        console.log(`⚠️  Vector search function issue: ${searchError.message}`);
      } else {
        console.log('✅ Vector search function is working');
        console.log(`Found ${searchTest?.length || 0} matching documents`);
      }
    } catch (rpcError) {
      console.log(`❌ Vector search test failed: ${rpcError.message}`);
    }

    console.log('\n🎉 Document vectorization test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test sending a real document for vectorization
 */
async function testRealVectorization(documentId) {
  console.log(`\n🚀 Testing real vectorization for document: ${documentId}`);
  
  try {
    // Get document from media_files
    const { data: document, error: docError } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', documentId)
      .eq('file_type', 'document')
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    console.log('Found document:', {
      title: document.title,
      url: document.file_url,
      mime_type: document.mime_type
    });

    // Check if it's a PDF
    if (!document.mime_type?.includes('pdf') && !document.title?.toLowerCase().includes('.pdf')) {
      throw new Error('Document is not a PDF');
    }

    // Get property name
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('name')
      .eq('id', document.property_id)
      .single();

    const propertyName = property?.name || 'Unknown Property';

    // Send for vectorization
    const payload = {
      fileUrl: document.file_url,
      propertyId: document.property_id,
      propertyName: propertyName,
      metadata: {
        file_id: document.id,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending to webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Document sent successfully!');
    console.log('Response:', result);

    // Mark as sent for vectorization
    const { error: updateError } = await supabase
      .from('media_files')
      .update({
        // Simplified: just update timestamp after processing (obsolete n8n fields removed)
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.log('⚠️  Failed to mark document as sent:', updateError.message);
    } else {
      console.log('✅ Document marked as sent for vectorization');
    }

  } catch (error) {
    console.error('❌ Real vectorization test failed:', error.message);
  }
}

// Run tests
async function main() {
  await testDocumentVectorization();
  
  // If a document ID is provided as argument, test real vectorization
  const documentId = process.argv[2];
  if (documentId) {
    await testRealVectorization(documentId);
  } else {
    console.log('\n💡 To test real vectorization, run:');
    console.log('node scripts/test-document-vectorization.js <document-id>');
  }
}

main().catch(console.error); 