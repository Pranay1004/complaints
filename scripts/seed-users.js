const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🚀 Starting to seed IIST User Directory...');
  const users = [];

  // 1. MASTERS (500 total)
  // 250 for 2024, 250 for 2025
  ['24', '25'].forEach(year => {
    for (let i = 1; i <= 250; i++) {
      const id = `SC${year}M${i.toString().padStart(3, '0')}`;
      users.push({ id, role: 'student', year: `20${year}`, department: 'Masters' });
    }
  });

  // 2. BACHELORS (1000 total)
  // 250 each for 2022, 2023, 2024, 2025
  ['22', '23', '24', '25'].forEach(year => {
    for (let i = 1; i <= 250; i++) {
      const id = `SC${year}B${i.toString().padStart(3, '0')}`;
      users.push({ id, role: 'student', year: `20${year}`, department: 'Bachelors' });
    }
  });

  // 3. DOCTORAL (500 total)
  ['21', '22', '23', '24', '25'].forEach(year => {
    for (let i = 1; i <= 100; i++) {
      const id = `SC${year}D${i.toString().padStart(3, '0')}`;
      users.push({ id, role: 'student', year: `20${year}`, department: 'PhD' });
    }
  });

  // 4. MANAGEMENT & STAFF (500 total)
  const staffRoles = [
    { prefix: 'ST', role: 'staff' },
    { prefix: 'FA', role: 'faculty' },
    { prefix: 'HA', role: 'hostel' },
    { prefix: 'AA', role: 'academic' },
    { prefix: 'MN', role: 'maintenance' }
  ];

  staffRoles.forEach(s => {
    for (let i = 1; i <= 100; i++) {
      const id = `${s.prefix}${i.toString().padStart(5, '0')}`;
      users.push({ id, role: s.role, department: 'Management' });
    }
  });

  console.log(`📦 Generated ${users.length} user entries. Uploading to Supabase...`);

  // Upload in chunks of 500 to avoid request limits
  const chunkSize = 500;
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    const { error } = await supabase.from('pre_authorized_users').insert(chunk);
    if (error) {
      console.error('Error seeding chunk:', error);
    } else {
      console.log(`✅ Uploaded entries ${i + 1} to ${Math.min(i + chunkSize, users.length)}`);
    }
  }

  console.log('🎉 Seeding complete! All 2500 entries are live.');
}

seed();
