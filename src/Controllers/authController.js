import { db, auth } from "../Models/FirebaseConfigModel.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Login com Firebase Authentication
 */
export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
  }

  try {
    // Autentica com Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Busca nome do usuário no Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    res.json({
      success: true,
      message: "Login bem-sucedido",
      nome: userDoc.exists() ? userDoc.data().nome : "Usuário",
      token: await user.getIdToken(), // Gera token JWT do Firebase
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Credenciais inválidas", error: error.message });
  }
};

/**
 * Cadastro de novo usuário no Firebase Authentication e Firestore
 */
export const NovoLogin = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: "Campos obrigatórios faltando." });
  }

  try {
    // Cria usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Armazena nome do usuário no Firestore
    await setDoc(doc(db, "users", user.uid), { nome, email });

    res.json({ success: true, message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erro ao cadastrar usuário", error: error.message });
  }
};
