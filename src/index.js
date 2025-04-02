import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, NovoLogin } from './Controllers/authController.js';
import { GeraTexto } from './Controllers/IAController.js';
import {
  buscarInformacoes,
  adicionarInformacao,
  editarInformacao,
  excluirInformacao,
} from './Controllers/informacoesController.js';
import { buscarConfiguracoes } from './Controllers/configuracoesController.js';

dotenv.config(); // Carregar variáveis do .env

const PORT = process.env.PORT || 7373;

const app = express();
app.use(helmet());

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo da requisição
app.use(cors()); // Habilita o CORS

// Rotas de autenticação
app.post('/login', login);
app.post('/nlogin', NovoLogin);

// Rota do chatbot
app.post("/chatbot", async (req, res) => {
  let { prompt } = req.body;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: "O campo 'prompt' deve ser uma string não vazia." });
  }

  try {
    const resposta = await GeraTexto(prompt.trim(), req.headers["user-email"]);
    res.json({ response: resposta });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

// Rotas de informações
app.get("/informacoes", buscarInformacoes);
app.post("/informacoes", adicionarInformacao);
app.put("/informacoes/:id", editarInformacao);
app.delete("/informacoes/:id", excluirInformacao);

// Rota de configurações
app.get("/configuracoes", buscarConfiguracoes);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
