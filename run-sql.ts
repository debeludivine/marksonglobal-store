import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });

async function run() {
  const ref = 'itmjdzwuougoiqwbppsb';
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN');
    process.exit(1);
  }

  const sql = fs.readFileSync('./supabase_idempotency.sql', 'utf8');

  console.log('Executing SQL on Supabase project:', ref);
  
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Failed to execute SQL. Status: ${response.status} ${response.statusText}`);
    console.error(errorBody);
    process.exit(1);
  }

  const result = await response.json();
  console.log('Success! SQL executed successfully.');
  // console.log(result);
}

run().catch(console.error);
