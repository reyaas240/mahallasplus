const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: "postgresql://postgres.yvjdmtwpovnfusrznafb:Hdn098MxGeOVreMv@aws-1-us-east-1.pooler.supabase.com:5432/postgres",
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

test();
