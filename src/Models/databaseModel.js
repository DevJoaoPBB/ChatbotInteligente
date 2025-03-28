import firebird from "node-firebird";

const Dboptions = {
    host: "localhost",
    port: 3050,
    database: "D:\\CLAUDIO.FDB",
    user: "SYSDBA",
    password: "masterkey",
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    charset: "none",
    fontcharset: "UTF8"
};

// Conectar ao banco de dados
firebird.attach(Dboptions, (err, db) => {
    if (err) {
        console.error("Erro ao conectar ao Firebird:", err);
        return;
    }
    console.log("Conectado ao Firebird!");

    // Importante: Fechar a conexão quando não for mais necessária
    db.detach();
});

export {Dboptions};