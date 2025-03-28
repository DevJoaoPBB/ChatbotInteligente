import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { GeraTexto } from "./IAController.js";

const TELEGRAM_TOKEN = "7634929664:AAHsXx5m0fJE45F5yIGtCledP4AH_08FX9Y"
if (!TELEGRAM_TOKEN) {
    throw new Error("Token do Telegram não encontrado! Verifique o arquivo");
}

const bot = new Telegraf(TELEGRAM_TOKEN);

// Evento para receber mensagens
bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const userMessage = ctx.message.text;
    const userEmail = "joaopedroboeing688@gmail.com"; // Ajuste para pegar o e-mail real do usuário

    try {
    
        // Concatena regras com a mensagem do usuário
        const entradaFinal = `${userMessage}`;
    
        // Chama a função GeraTexto para obter a resposta da IA
        const resposta = await GeraTexto(entradaFinal, userEmail);
    
        // Envia a resposta para o usuário no Telegram
        await ctx.reply(resposta);
        console.log(userMessage)
      } catch (error) {
        console.error("Erro ao processar a mensagem:", error);
        await ctx.reply("Desculpe, ocorreu um erro ao processar sua solicitação.");
      }
    });

// Inicia o bot
bot.launch();
console.log("Bot do Telegram rodando!");

// Trata encerramento seguro
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
