const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config(); // Looks for .env in current directory

async function init() {
    try {
        console.log('Connecting to MySQL on port', process.env.DB_PORT || 3306);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || 3306)
        });

        console.log('Creating database if not exists...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        await connection.query(`USE \`${process.env.DB_NAME}\``);

        console.log('Running schema.sql...');
        const schemaPath = path.join(__dirname, 'models/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and run each query
        // Simple split might fail on semicolons inside strings, but for standard schema.sql it's usually fine
        const queries = schema.split(';').filter(q => q.trim() !== '');
        for (let query of queries) {
            try {
                await connection.query(query);
            } catch (err) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('Table already exists, skipping...');
                } else {
                    throw err;
                }
            }
        }

        console.log('Database initialized successfully!');
        await connection.end();
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
}

init();
