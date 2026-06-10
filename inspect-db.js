const path = require('path');
const dbPath = path.join(__dirname, 'dev.db');

let db;
try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath, { readonly: true });
} catch(e) {
  console.log('better-sqlite3 not available, trying sqlite3 module...', e.message);
  process.exit(1);
}

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables found:', tables.map(t => t.name).join(', '));
for (const t of tables) {
  if (t.name.startsWith('_')) continue;
  const count = db.prepare('SELECT COUNT(*) as c FROM "' + t.name + '"').get();
  console.log(' -', t.name + ':', count.c, 'rows');
  if (count.c > 0 && count.c <= 5) {
    const rows = db.prepare('SELECT * FROM "' + t.name + '" LIMIT 3').all();
    console.log('   Sample:', JSON.stringify(rows[0]).substring(0, 120));
  }
}
db.close();
