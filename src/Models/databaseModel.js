require('dotenv').config();  // Carregar variáveis de ambiente

import firebird from "node-firebird";

const Dboptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    charset: process.env.DB_CHARSET,
    fontcharset: "UTF8"  // Se necessário para o charset da fonte
};

// Conectar ao banco de dados
firebird.attach(Dboptions, (err, db) => {
    if (err) {
        console.error("Erro ao conectar ao Firebird:", err);
        return;
    }
    console.log("Conectado ao Firebird!");

    // Fechar a conexão após conectar
    db.detach();
});

export { Dboptions };
