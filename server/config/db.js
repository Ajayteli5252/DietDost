const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Supabase PostgreSQL connection failed:', err.message);
        return;
    }
    console.log('✅ Supabase PostgreSQL connected successfully!');
    release();
});

// Helper function to translate MySQL-style '?' placeholders and date functions to PostgreSQL
function formatPostgresQuery(sql) {
    let paramIndex = 1;
    
    // Replace '?' placeholders with $1, $2, etc. (outside of quotes)
    let formattedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

    // Automatically translate common MySQL-specific expressions to PostgreSQL
    formattedSql = formattedSql
        .replace(/DATE_SUB\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\)/gi, "(CURRENT_DATE - INTERVAL '$1 day')")
        .replace(/DATE_SUB\(\s*DATE\(\s*CONVERT_TZ\(\s*NOW\(\)\s*,\s*'\+00:00'\s*,\s*'\+05:30'\s*\)\s*\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\)/gi, "((NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '$1 day')")
        .replace(/DATE_SUB\(\s*(\$\d+)\s*,\s*INTERVAL\s+(\d+)\s+DAY\)/gi, "($1::date - INTERVAL '$2 day')")
        .replace(/CONVERT_TZ\(\s*NOW\(\)\s*,\s*'\+00:00'\s*,\s*'\+05:30'\s*\)/gi, "(NOW() AT TIME ZONE 'Asia/Kolkata')");

    return formattedSql;
}

// Wrapper for query to maintain mysql2 compatibility [rows, fields/result]
const db = {
    pool,
    async query(sql, params = []) {
        let text = formatPostgresQuery(sql);
        const isInsert = /^\s*INSERT\s+INTO\s+/i.test(text);

        // If INSERT and doesn't already have RETURNING, add RETURNING id
        if (isInsert && !/RETURNING/i.test(text)) {
            text = `${text.replace(/;\s*$/, '')} RETURNING id`;
        }

        const res = await pool.query(text, params);

        const resultMeta = {
            insertId: (res.rows && res.rows[0] && res.rows[0].id !== undefined) ? res.rows[0].id : null,
            affectedRows: res.rowCount,
            rowCount: res.rowCount,
            rows: res.rows
        };

        // If it's an INSERT/UPDATE/DELETE where controllers expect result metadata in the first destructured element:
        if (/^\s*(INSERT|UPDATE|DELETE)\s+/i.test(sql) && !sql.toLowerCase().includes('returning')) {
            return [resultMeta, res.fields];
        }

        return [res.rows, res.fields];
    },

    // Provide promise() for any legacy calls
    promise() {
        return this;
    }
};

module.exports = db;