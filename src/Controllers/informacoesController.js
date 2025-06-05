import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../Models/FirebaseConfigModel.js"
import { addDoc, deleteDoc,updateDoc} from "firebase/firestore";
// Método para buscar todas as informações

export const buscarInformacoes = async (req, res) => {
  const userEmail = req.headers['user-email'];

  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'Usuário não autenticado.' });
  }

  try {
    const colRef = collection(db, userEmail); // Coleção com o nome do e-mail
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'Nenhuma informação encontrada.' });
    }

    const dados = [];
    snapshot.forEach(doc => {
      dados.push({ id: doc.id, ...doc.data() });
    });

    return res.json({ success: true, data: dados });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar informações', error: error.message });
  }
};


export const adicionarInformacao = async (req, res) => {
  const { palavraChave, descricao } = req.body;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !palavraChave || !descricao) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  try {
    await addDoc(collection(db, userEmail), {
      PALAVRASCHAVE: palavraChave,
      INFORMACAO: descricao,
      USUARIO: userEmail,
      DATA_ATUALIZACAO: new Date().toISOString(), // Data de atualização
    });

    return res.json({ success: true, message: 'Informação adicionada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao adicionar informação', error: error.message });
  }
};

// Método para editar uma informação existente
export const editarInformacao = async (req, res) => {
  const { id } = req.params;
  const { palavraChave, descricao } = req.body;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !id || !palavraChave || !descricao) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  try {
    const docRef = doc(db, userEmail, id); // Referência do documento a ser atualizado
    await updateDoc(docRef, { // Utilizando updateDoc para atualizar o documento
      PALAVRASCHAVE: palavraChave,
      INFORMACAO: descricao,
      DATA_ATUALIZACAO: new Date().toISOString(), // Atualizando a data de atualização
    });

    return res.json({ success: true, message: 'Informação atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao atualizar informação', error: error.message });
  }
};


// Método para excluir uma informação
export const excluirInformacao = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !id) {
    return res.status(400).json({ success: false, message: 'ID da informação ou usuário não fornecido.' });
  }

  try {
    const docRef = doc(db, userEmail, id);
    await deleteDoc(docRef);

    return res.json({ success: true, message: 'Informação excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao excluir informação', error: error.message });
  }
};
