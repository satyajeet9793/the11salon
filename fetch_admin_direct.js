const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.brrxznyqadwcnsaiwzij:the11salonkolhapur@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT email FROM "User" WHERE role = \'ADMIN\';');
    console.log("Admins found:", res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
