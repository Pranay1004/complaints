const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'iist_local.db');
const db = new Database(dbPath);

function seedLocal() {
  console.log('🚀 Seeding local SQLite Database...');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS pre_authorized_users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      department TEXT,
      year TEXT
    );
  `);

  const users = [];

  // MASTERS
  ['24', '25'].forEach(year => {
    for (let i = 1; i <= 250; i++) {
      users.push({ id: `SC${year}M${i.toString().padStart(3, '0')}`, role: 'student', year: `20${year}`, department: 'Masters' });
    }
  });

  // BACHELORS
  ['22', '23', '24', '25'].forEach(year => {
    for (let i = 1; i <= 250; i++) {
      users.push({ id: `SC${year}B${i.toString().padStart(3, '0')}`, role: 'student', year: `20${year}`, department: 'Bachelors' });
    }
  });

  // PhD
  ['21', '22', '23', '24', '25'].forEach(year => {
    for (let i = 1; i <= 100; i++) {
      users.push({ id: `SC${year}D${i.toString().padStart(3, '0')}`, role: 'student', year: `20${year}`, department: 'PhD' });
    }
  });

  // STAFF
  const staffRoles = [
    { prefix: 'ST', role: 'staff' },
    { prefix: 'FA', role: 'faculty' },
    { prefix: 'HA', role: 'hostel' },
    { prefix: 'AA', role: 'academic' },
    { prefix: 'MN', role: 'maintenance' }
  ];

  staffRoles.forEach(s => {
    for (let i = 1; i <= 100; i++) {
      users.push({ id: `${s.prefix}${i.toString().padStart(5, '0')}`, role: s.role, department: 'Management' });
    }
  });

  const insert = db.prepare('INSERT OR REPLACE INTO pre_authorized_users (id, role, year, department) VALUES (?, ?, ?, ?)');
  
  const transaction = db.transaction((allUsers) => {
    for (const u of allUsers) {
      insert.run(u.id, u.role, u.year || null, u.department);
    }
  });

  transaction(users);
  console.log(`🎉 Successfully seeded ${users.length} entries into local database.`);
}

seedLocal();
