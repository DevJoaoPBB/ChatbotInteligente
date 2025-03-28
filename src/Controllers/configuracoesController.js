import firebird from 'node-firebird';
import { Dboptions } from '../Models/databaseModel.js';
import { ExecutaSQL } from '../Models/queryModel.js';

export const buscarConfiguracoes = (req, res) => {
  const userEmail = req.headers['user-email']; // Alterado para obter o e-mail do cabeçalho
 
  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'Usuário não autenticado.' });
  }

const ssql = `SELECT 
              T001_NR_CODIGO AS REGISTRO,
              T001_CA_PALAVRA_CHAVE AS PALAVRASCHAVE,
              T001_CA_DESCRICAO AS INFORMACAO,
              T002_CA_USUARIO AS USUARIO
              FROM T001_INFORMACOES
              WHERE T002_CA_USUARIO = ?`;


  firebird.attach(Dboptions, function (err, db) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco', error: err });
    }

    db.query(ssql, [userEmail], function (err, result) {
      db.detach(function (detachErr) {
        if (detachErr) {
          console.error('Erro ao desanexar o banco:', detachErr);
        }
      });

      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao buscar informações', error: err });
      }

      res.json({ success: true, data: result });
    });
  });
};