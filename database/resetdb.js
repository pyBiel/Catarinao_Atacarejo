const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho absoluto para o arquivo do banco
const dbPath = path.resolve(__dirname, 'economia.db');

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro ao conectar ao banco de dados:', err.message);
    else console.log('Banco de dados SQLite conectado com sucesso.');
});

// Função para resetar os valores da tabela "users"
async function resetDatabaseWithDefaults() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Resetar os valores para os padrões
            db.run(`
                UPDATE users
                SET 
                    wallet = 0,
                    bank = 0,
                    dirty_money = 0,
                    job = NULL,
                    level = 1,
                    experience = 0
            `, (err) => {
                if (err) {
                    console.error('Erro ao resetar os valores:', err.message);
                    reject(err);
                } else {
                    console.log('Valores da tabela "users" resetados para os padrões.');
                    resolve();
                }
            });
        });
    });
}

// Chamar a função de reset
(async () => {
    try {
        await resetDatabaseWithDefaults();
        console.log('Reset concluído com sucesso!');
    } catch (err) {
        console.error('Erro durante o reset:', err.message);
    } finally {
        db.close(); // Fechar a conexão com o banco
    }
})();
