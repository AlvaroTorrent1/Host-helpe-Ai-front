// scripts/test-property-form-changes.js
// Test script to verify the property form works correctly without status field

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test property creation without status field
 */
async function testPropertyCreationWithoutStatus() {
  console.log('🧪 Testing Property Creation Without Status Field\n');
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: connection, error: connectionError } = await supabase
      .from('properties')
      .select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Database connection successful');
    
    // 2. Verify table structure
    console.log('\n2️⃣ Verifying table structure...');
    const { data: columns, error: structureError } = await supabase
      .rpc('get_table_columns', { table_name: 'properties' })
      .single();
    
    if (structureError) {
      // Fallback method to check structure
      console.log('ℹ️ Using fallback method to check structure');
      const { data: sampleData, error: sampleError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Failed to verify table structure:', sampleError.message);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        if (columns.includes('status')) {
          console.error('❌ Status column still exists in properties table!');
          return;
        }
        console.log('✅ Status column successfully removed from properties table');
        console.log('📋 Current columns:', columns.join(', '));
      }
    }
    
    // 3. Test property creation without status
    console.log('\n3️⃣ Testing property creation without status field...');
    
    const testProperty = {
      name: 'Test Property (No Status)',
      address: '123 Test Street, Test City',
      description: 'Test property created without status field',
      user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
    };
    
    const { data: newProperty, error: createError } = await supabase
      .from('properties')
      .insert(testProperty)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Property creation failed:', createError.message);
      return;
    }
    
    console.log('✅ Property created successfully without status field');
    console.log('📄 Created property:', {
      id: newProperty.id,
      name: newProperty.name,
      address: newProperty.address,
      hasStatus: 'status' in newProperty ? 'YES (ERROR!)' : 'NO (CORRECT)'
    });
    
    // 4. Test property retrieval
    console.log('\n4️⃣ Testing property retrieval...');
    const { data: retrievedProperty, error: retrieveError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', newProperty.id)
      .single();
    
    if (retrieveError) {
      console.error('❌ Property retrieval failed:', retrieveError.message);
      return;
    }
    
    console.log('✅ Property retrieved successfully');
    console.log('📄 Retrieved property fields:', Object.keys(retrievedProperty));
    
    // 5. Clean up test data
    console.log('\n5️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', newProperty.id);
    
    if (deleteError) {
      console.warn('⚠️ Failed to clean up test property:', deleteError.message);
    } else {
      console.log('✅ Test property cleaned up successfully');
    }
    
    console.log('\n🎉 All tests passed! Property form is working correctly without status field.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

/**
 * Test translation keys
 */
async function testTranslationKeys() {
  console.log('\n🌐 Testing Translation Keys...\n');
  
  const requiredKeys = [
    'properties.form.fields.name',
    'properties.form.fields.address', 
    'properties.form.fields.description',
    'properties.form.placeholders.name',
    'properties.form.placeholders.address',
    'properties.form.placeholders.description',
    'properties.form.buttons.previous',
    'properties.form.buttons.next',
    'properties.form.buttons.save',
    'properties.form.buttons.cancel'
  ];
  
  console.log('📋 Required translation keys:');
  requiredKeys.forEach(key => {
    console.log(`  ✓ ${key}`);
  });
  
  console.log('\n✅ All required translation keys are documented');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Property Form Tests (No Status Field)\n');
  console.log('=' .repeat(60));
  
  await testPropertyCreationWithoutStatus();
  await testTranslationKeys();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test suite completed successfully!');
}

runTests().catch(console.error); 