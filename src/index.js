import helmet  from 'helmet';
import express from 'express';
import cors from 'cors';
import { login, NovoLogin } from './Controllers/authController.js';
import { GeraTexto } from './Controllers/IAController.js';
import {
  buscarInformacoes,
  adicionarInformacao,
  editarInformacao,
  excluirInformacao,
} from './Controllers/informacoesController.js';
import { buscarConfiguracoes } from './Controllers/configuracoesController.js'
const app = express();
app.use(helmet());

// Middlewares
app.use(express.json()); // Para parsear JSON no corpo da requisição
app.use(cors()); // Habilita o CORS

// ROTA DE AUTENTICAÇÃO (não protegida, pois a autenticação é necessária para obter o token)
app.post('/login', login);
app.post('/nlogin', NovoLogin)

// ROTA DO CHATBOT
app.post("/chatbot", async (req, res) => {
  const prompt = (req.body.prompt || "").trim(); // Sanitização básica

  if (!prompt) {
    return res.status(400).json({ error: "Prompt não fornecido." });
  }

  try {
    // Definição das regras com delimitador forte

    // Chamada para geração de texto
    const resposta = await GeraTexto(prompt, req.headers["user-email"]);
    
    res.json({ response: resposta });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});



// ROTAS DE INFORMAÇÕES
app.get("/informacoes", buscarInformacoes); // Protege a rota
app.post("/informacoes", adicionarInformacao); // Protege a rota
app.put("/informacoes/:id", editarInformacao); // Protege a rota
app.delete("/informacoes/:id", excluirInformacao); // Protege a rota

//ROTAS DE CONFIGURAÇÕES
app.get("/configuracoes", buscarConfiguracoes)


// Recupera a porta do .env ou usa 7373 como padrão
const port = 7373;

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
