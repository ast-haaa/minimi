import { getDb } from './connection.js';

function main() {
  console.log('Running database migrations...');
  try {
    const db = getDb();
    console.log('Database initialized successfully.');
    
    // Verify tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[];
    console.log('Tables:', tables.map(t => t.name).join(', '));
    
    db.close();
    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
