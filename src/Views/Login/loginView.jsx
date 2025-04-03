import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "./icone.png";
import { ToastContainer, toast } from "react-toastify";
import { Loader } from "lucide-react";
import "react-toastify/dist/ReactToastify.css"; // Estilos padrão

// Função de validação de e-mail e senha
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (senha) => senha.length >= 6;

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Se o usuário já estiver logado, redireciona para /home
  useEffect(() => {
    if (localStorage.getItem("userEmail")) {
      navigate("/home");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.warning("Insira um email válido!");
      return;
    }
    if (!validatePassword(senha)) {
      toast.warning("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://chatbotinteligente-x5rt.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.nome);
        navigate("/home");
      } else {
        toast.error("Credenciais inválidas, tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao tentar realizar login, tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-96 bg-gray-800 p-8 rounded-2xl shadow-lg text-white text-center">
        <div className="flex justify-center mb-4">
          <div className="w-36 h-36 bg-gray-700 rounded-full flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-full" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-6">MyChatbot</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 mb-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          {loading ? (
            <div className="flex justify-center">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition flex items-center justify-center"
            >
              Acessar
            </button>
          )}
        </form>

      </div>

      {/* Notificações */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
