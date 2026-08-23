const { Client } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function init() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to Supabase PostgreSQL database...');
        await client.connect();
        console.log('✅ Connected successfully!');

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'models/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema queries...');
        await client.query(schema);

        console.log('🎉 Database tables initialized successfully on Supabase!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

init();
