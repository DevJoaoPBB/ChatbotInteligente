import { ExecutaSQL } from '../Models/queryModel.js';
import firebird from 'node-firebird';
import { Dboptions } from '../Models/databaseModel.js';

export const login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  let filtro = [email, senha]; // Senha deve ser armazenada com hash no banco!
  let ssql = 'SELECT T002_CA_LOGIN AS EMAIL, T002_CA_NOME AS NOME FROM T002_USUARIOS WHERE T002_CA_LOGIN = ? AND T002_CA_SENHA = ?';

  ExecutaSQL(ssql, filtro, function (err, result) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao autenticar', error: err });
    }

    if (result.length > 0) {
      const user = result[0]; // Pegamos o primeiro usuário encontrado

      res.json({
        success: true,
        message: 'Login bem-sucedido',
        nome: user.NOME, // Enviamos o nome do usuário
        token: "TOKENNIZER", // Você precisa gerar um token JWT real
      });
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
  });
};


export const NovoLogin = (req, res) => {
  const { nome, email, senha } = req.body;

  //console.log("Dados recebidos:", { palavraChave, descricao, userEmail });

  if (!nome || !email || !senha) {
    console.error("Erro: Campos obrigatórios ausentes.");
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  const ssql = `
      INSERT INTO T002_USUARIOS (T002_CA_LOGIN, T002_CA_SENHA, T002_CA_NOME) 
      VALUES (?, ?, ?)
    `;

  firebird.attach(Dboptions, function (err, db) {
    if (err) {
      //console.error("Erro ao conectar ao banco:", err);
      return res.status(500).json({ success: false, message: 'Erro ao conectar ao banco', error: err });
    }

    db.query(ssql, [email, senha, nome], function (err, result) {
      db.detach();
      if (err) {
        //console.error("Erro ao adicionar informação:", err);
        return res.status(500).json({ success: false, message: 'Erro ao adicionar usuário', error: err });
      }

      //console.log("Informação adicionada com sucesso!");

      res.json({ success: true, message: 'Usuário adicionado com sucesso' });
    });
  });
};
