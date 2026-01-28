#!/usr/bin/env node

/**
 * Initialize Tripplan database tables
 * This script uses Supabase admin client to create all tables
 */

const fs = require('fs');
const path = require('path');

// Read SQL migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20260128_init_tripplan.sql');
const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

console.log('📝 SQL Migration Content:');
console.log('─'.repeat(60));
console.log(sqlContent);
console.log('─'.repeat(60));

console.log('\n✅ SQL migration file is ready.');
console.log('📌 To execute, paste the SQL above into Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/byvcabgcjkykwptzmwsl/sql\n');

// Also generate a curl command for direct API execution
const projectId = 'byvcabgcjkykwptzmwsl';
const apiUrl = `https://${projectId}.supabase.co/rest/v1/`;

console.log('🔗 Alternative: Execute via Supabase API (requires auth token)');
console.log(`   POST ${apiUrl}rpc/exec_sql`);
console.log('   With body: {"query": "YOUR_SQL_HERE"}\n');
