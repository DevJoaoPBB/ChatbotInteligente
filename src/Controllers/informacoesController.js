import firebird from 'node-firebird';
import { Dboptions } from '../Models/databaseModel.js';
import { ExecutaSQL } from '../Models/queryModel.js';

// Método para buscar todas as informações
export const buscarInformacoes = (req, res) => {
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


export const adicionarInformacao = (req, res) => {
  const { palavraChave, descricao } = req.body;
  const userEmail = req.headers['user-email']; 

  //console.log("Dados recebidos:", { palavraChave, descricao, userEmail });

  if (!userEmail || !palavraChave || !descricao) {
    console.error("Erro: Campos obrigatórios ausentes.");
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  const ssql = `
    INSERT INTO T001_INFORMACOES (T001_CA_PALAVRA_CHAVE, T001_CA_DESCRICAO, T002_CA_USUARIO) 
    VALUES (?, ?, ?)
  `;

  firebird.attach(Dboptions, function (err, db) {
    if (err) {
      //console.error("Erro ao conectar ao banco:", err);
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco', error: err });
    }

    db.query(ssql, [palavraChave, descricao, userEmail], function (err, result) {
      db.detach();
      if (err) {
        //console.error("Erro ao adicionar informação:", err);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar informação', error: err });
      }

      //console.log("Informação adicionada com sucesso!");

         res.json({ success: true, message: 'Informação adicionada com sucesso' });
    });
  });
};

// Método para editar uma informação existente
export const editarInformacao = (req, res) => {
  const { id } = req.params;
  const { palavraChave, descricao } = req.body;

  if (!id || !palavraChave || !descricao) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  const ssql = `
    UPDATE T001_INFORMACOES 
    SET T001_CA_PALAVRA_CHAVE = ?, T001_CA_DESCRICAO = ? 
    WHERE T001_NR_CODIGO = ?
  `;

  firebird.attach(Dboptions, function (err, db) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco', error: err });
    }

    db.execute(ssql, [palavraChave, descricao, id], function (err, result) {
      db.detach();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao editar informação', error: err });
      }

      if (result === 0) {
        return res.status(404).json({ success: false, message: 'Informação não encontrada ou não foi atualizada.' });
      }

      res.json({ success: true, message: 'Informação editada com sucesso' });
    });
  });
};


// Método para excluir uma informação
export const excluirInformacao = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID da informação não fornecido.' });
  }

  const ssql = `DELETE FROM T001_INFORMACOES WHERE T001_NR_CODIGO = ?`;

  firebird.attach(Dboptions, function (err, db) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco', error: err });
    }

    db.execute(ssql, [id], function (err, result) {
      db.detach();
      if (err) {
        return res.status(500).json({ success: false, message: 'Erro ao excluir informação', error: err });
      }

      if (result === 0) {
        return res.status(404).json({ success: false, message: 'Informação não encontrada ou não foi excluída.' });
      }

      res.json({ success: true, message: 'Informação excluída com sucesso' });
    });
  });
};
