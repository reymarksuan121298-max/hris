const fs = require('fs');

const csvPath = 'tellers.csv';
const sqlPath = 'tellers_import.sql';

function parseCSVLine(line) {
    const results = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            results.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    results.push(current.trim());
    return results;
}

try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = parseCSVLine(lines[0]);

    const headerMap = {
        'fullName': 'full_name',
        'username': 'username',
        'address': 'address',
        'supervisor': 'supervisor',
        'contactNumber': 'contact_number',
        'outlet': 'outlet',
        'dateCreated': 'date_created',
        'area': 'area'
    };

    const mappedHeaders = headers.map(h => headerMap[h] || h);

    let sql = `-- SQL Import script for tellers\n`;
    sql += `CREATE TABLE IF NOT EXISTS tellers (\n`;
    sql += `    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n`;
    sql += `    full_name TEXT NOT NULL,\n`;
    sql += `    username TEXT UNIQUE NOT NULL,\n`;
    sql += `    address TEXT,\n`;
    sql += `    supervisor TEXT,\n`;
    sql += `    contact_number TEXT,\n`;
    sql += `    outlet TEXT,\n`;
    sql += `    date_created TIMESTAMP WITH TIME ZONE,\n`;
    sql += `    area TEXT,\n`;
    sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n`;
    sql += `);\n\n`;

    const rows = lines.slice(1);
    const batchSize = 100;

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        sql += `INSERT INTO tellers (${mappedHeaders.join(', ')})\nVALUES\n`;
        
        const valuesPart = batch.map(line => {
            const cols = parseCSVLine(line);
            const vals = cols.map(col => {
                let val = col.replace(/'/g, "''").trim();
                return val === '' ? 'NULL' : `'${val}'`;
            });
            return `(${vals.join(', ')})`;
        }).join(',\n') + ' ON CONFLICT (username) DO NOTHING;\n\n';
        
        sql += valuesPart;
    }

    fs.writeFileSync(sqlPath, sql);
    console.log('SQL file generated successfully: ' + sqlPath);
} catch (err) {
    console.error('Error:', err);
}
