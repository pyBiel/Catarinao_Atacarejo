const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho absoluto para o arquivo do banco
const dbPath = path.resolve(__dirname, 'economia.db');

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao conectar ao banco de dados:', err.message);
    else console.log('Banco de dados SQLite conectado com sucesso.');
});

// Criar a tabela "users" se ela não existir
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        wallet INTEGER DEFAULT 0,
        bank INTEGER DEFAULT 0,
        dirty_money INTEGER DEFAULT 0,
        job TEXT DEFAULT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0
    )
`);

module.exports = db;
