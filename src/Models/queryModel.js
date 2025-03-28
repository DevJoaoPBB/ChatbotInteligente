import { Dboptions } from "./databaseModel.js";
import firebird from "node-firebird";

function ExecutaSQL(ssql, params, callback) {
    // Conecta ao banco de dados
    firebird.attach(Dboptions, function (err, db) {
        if (err) {
            return callback(err, null); // Retorna erro se não conseguir conectar
        }

        // Executa a query
        db.query(ssql, params, function (err, result) {
            db.detach(); // Sempre desconecta após execução

            if (err) {
                return callback(err, null); // Retorna erro se a query falhar
            } 

            return callback(null, result); // Retorna o resultado da query
        });
    });
}

export { ExecutaSQL };
