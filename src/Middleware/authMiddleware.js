import { auth } from "../Models/FirebaseConfigModel.js";
import { getAuth } from "firebase-admin/auth";

/**
 * Middleware para verificar token do Firebase Authentication
 */
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Captura o token no formato "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken; // Adiciona os dados do usuário ao request
    next(); // Permite a continuação da requisição
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
