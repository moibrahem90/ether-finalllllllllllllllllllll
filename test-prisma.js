const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'dev.db');
const url = 'file:' + dbPath.replace(/\\/g, '/');
console.log('URL:', url);

// Test the adapter directly
const adapter = new PrismaBetterSqlite3({ url });
console.log('Adapter created:', adapter.provider);
adapter.connect().then(conn => {
  console.log('Connected!');
  conn.dispose();
}).catch(e => console.log('Connect ERR:', e.message, e.stack));
