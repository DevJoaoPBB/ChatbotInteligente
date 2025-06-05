import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Models/FirebaseConfigModel.js";

// Método para buscar todas as categorias
export const buscarCategorias = async (req, res) => {
  const userEmail = req.headers['user-email'];

  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'Usuário não autenticado.' });
  }

  try {
    const colRef = collection(db, `${userEmail}_CT`); // Coleção com o nome do e-mail + _CT
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'Nenhuma categoria encontrada.' });
    }

    const categorias = [];
    snapshot.forEach(doc => {
      categorias.push({ id: doc.id, ...doc.data() });
    });

    return res.json({ success: true, data: categorias });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar categorias', error: error.message });
  }
};

// Método para adicionar uma nova categoria
export const adicionarCategoria = async (req, res) => {
  const { categoria } = req.body;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !categoria) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  try {
    await addDoc(collection(db, `${userEmail}_CT`), {
      CATEGORIA: categoria,
      USUARIO: userEmail,
      DATA_ATUALIZACAO: new Date().toISOString(),
    });

    return res.json({ success: true, message: 'Categoria adicionada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao adicionar categoria', error: error.message });
  }
};

// Método para editar uma categoria existente
export const editarCategoria = async (req, res) => {
  const { id } = req.params;
  const { categoria } = req.body;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !id || !categoria) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
  }

  try {
    const docRef = doc(db, `${userEmail}_CT`, id);
    await updateDoc(docRef, {
      CATEGORIA: categoria,
      DATA_ATUALIZACAO: new Date().toISOString(),
    });

    return res.json({ success: true, message: 'Categoria atualizada com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao atualizar categoria', error: error.message });
  }
};

// Método para excluir uma categoria
export const excluirCategoria = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.headers['user-email'];

  if (!userEmail || !id) {
    return res.status(400).json({ success: false, message: 'ID da categoria ou usuário não fornecido.' });
  }

  try {
    const docRef = doc(db, `${userEmail}_CT`, id);
    await deleteDoc(docRef);

    return res.json({ success: true, message: 'Categoria excluída com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao excluir categoria', error: error.message });
  }
};
