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
import { verifyToken } from './Middleware/authMiddleware.js'; // Middleware de autenticação

dotenv.config(); // Carregar variáveis do .env

const PORT = process.env.PORT || 7373;

const app = express();
app.use(helmet());

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo da requisição
app.use(cors()); // Habilita o CORS

// Rotas de autenticação
app.post('/login', login);
app.post('/register', NovoLogin); 

// Rota do chatbot
app.post("/chatbot", async (req, res) => {
  let { prompt } = req.body;
  const userEmail = req.headers["user-email"];

  if (!userEmail) {
    return res.status(400).json({ error: "Email do usuário é obrigatório!" });
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: "Nenhuma informação enviada para a I.A!" });
  }

  try {
    const resposta = await GeraTexto(prompt.trim(), userEmail);
    res.json({ response: resposta });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

// Rotas de informações (Protegidas por autenticação)
app.get("/informacoes", verifyToken, buscarInformacoes);
app.post("/informacoes", verifyToken, adicionarInformacao);
app.put("/informacoes/:id", verifyToken, editarInformacao);
app.delete("/informacoes/:id", verifyToken, excluirInformacao);

// Rota de configurações (Protegida)
app.get("/configuracoes", verifyToken, buscarConfiguracoes);

// Inicialização do servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
