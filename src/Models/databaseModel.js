import firebird from "node-firebird";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Dboptions = {
    host: "localhost",
    port: 3050,
    database: path.join(__dirname, "CLAUDIO.FDB"), // Caminho absoluto
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