import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  
  const response = await fetch(`https://api.supabase.com/v1/projects`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.error(`Status: ${response.status} ${response.statusText}`);
    console.error(await response.text());
    process.exit(1);
  }

  const projects = await response.json();
  console.log('Projects:', projects.map((p: any) => p.id));
}

run().catch(console.error);
