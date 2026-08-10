const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.brrxznyqadwcnsaiwzij:the11salonkolhapur@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM "User" LIMIT 5;');
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

run();
